"use server";

import type { Mood } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { startOfDay, addDays } from "@/lib/utils/date-utils";

import { action } from "../handlers/action";
import { handleError } from "../handlers/error";
import type { GetStreakParams, StreakData } from "../types/streaks";
import { GetStreakSchema } from "../validations/streaks-validations";

interface CheckInActionParams {
  userId: string;
  mood: Mood;
  points: number;
}

export async function checkInAction({
  userId,
  mood,
  points,
}: CheckInActionParams) {
  try {
    const today = startOfDay();
    const tomorrow = addDays(today, 1);

    // Get or create user streak
    let userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      userStreak = await prisma.userStreak.create({
        data: {
          currentStreak: 0,
          lastCheckInDate: today,
          longestStreak: 0,
          userId,
        },
      });
    }

    // Check if already checked in today
    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        userId,
      },
    });

    if (existingCheckIn) {
      return {
        data: null,
        error: "Already checked in today",
        success: false,
      };
    }

    // Check if streak should continue or reset
    const { lastCheckInDate } = userStreak;
    const daysDiff = Math.floor(
      (today.getTime() - (lastCheckInDate?.getTime() || 0)) /
        (1000 * 60 * 60 * 24)
    );

    // Check if streak is frozen
    const isFrozen = userStreak.frozenUntil && userStreak.frozenUntil > today;

    let newStreak = userStreak.currentStreak;
    let streakBonus = 0;
    let freezeApplied = false;

    if (daysDiff === 1 || isFrozen) {
      // Continued streak (either natural day or frozen)
      newStreak++;
      streakBonus = calculateStreakBonus(newStreak);
    } else if (daysDiff > 1 && !isFrozen) {
      // Streak about to break - check for available freezes
      const freezeResult = await checkAndApplyFreezeAction({
        missedDays: daysDiff - 1,
        userId,
      });

      if (freezeResult.success) {
        // Freeze successfully applied
        newStreak++;
        streakBonus = calculateStreakBonus(newStreak);
        freezeApplied = true;
        logger.info(
          {
            daysMissed: daysDiff - 1,
            freezesUsed: freezeResult.data?.freezesUsed,
            frozenUntil: freezeResult.data?.frozenUntil,
            userId,
          },
          "Auto-applied freeze to save streak"
        );
      } else {
        // No freeze available - streak broken
        newStreak = 1;
        streakBonus = 10; // Bonus for starting fresh
      }
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(userStreak.longestStreak, newStreak);

    // Create daily check-in record
    await prisma.dailyCheckIn.create({
      data: {
        date: today,
        mood,
        points,
        userId,
      },
    });

    // Update user streak
    await prisma.userStreak.update({
      data: {
        currentStreak: newStreak,
        lastCheckInDate: today,
        longestStreak: newLongestStreak,
      },
      where: { userId },
    });

    // Update user points
    const totalPoints = points + streakBonus;
    await prisma.user.update({
      data: {
        points: {
          increment: totalPoints,
        },
        streakPoints: {
          increment: streakBonus,
        },
      },
      where: { id: userId },
    });

    // Log the check-in
    logger.info(
      {
        mood,
        newStreak,
        points,
        streakBonus,
        timestamp: new Date().toISOString(),
        totalPoints,
        userId,
      },
      "Daily check-in completed"
    );

    // Revalidate dashboard to show updated data
    revalidatePath(ROUTES.DASHBOARD);

    return {
      data: {
        freezeApplied,
        frozenUntil: userStreak.frozenUntil,
        mood,
        pointsEarned: totalPoints,
        streak: newStreak,
        streakBonus,
      },
      success: true,
    };
  } catch (error) {
    logger.error(error, "Check-in action failed");
    return {
      data: null,
      error: "Failed to check in",
      success: false,
    };
  }
}

export async function getUserStreakAction(
  params: GetStreakParams
): Promise<ActionResponse<StreakData>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetStreakSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      return {
        success: true,
      };
    }

    // Get today's check-in
    const today = startOfDay();
    const tomorrow = addDays(today, 1);

    const todayCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        userId,
      },
    });

    return {
      data: {
        ...userStreak,
        hasCheckedInToday: !!todayCheckIn,
      },
      success: true,
    };
  } catch (error) {
    logger.error(error, "Get user streak action failed");

    return handleError(error) as ErrorResponse;
  }
}

export async function getCheckInHistoryAction({
  userId,
  limit = 30,
}: {
  userId: string;
  limit?: number;
}) {
  try {
    const checkIns = await prisma.dailyCheckIn.findMany({
      orderBy: { date: "desc" },
      take: limit,
      where: { userId },
    });

    return {
      data: checkIns,
      success: true,
    };
  } catch (error) {
    logger.error(error, "Get check-in history action failed");
    return {
      data: null,
      error: "Failed to get check-in history",
      success: false,
    };
  }
}

function calculateStreakBonus(streak: number): number {
  const bonuses = [
    { bonus: 10, days: 1 },
    { bonus: 30, days: 3 },
    { bonus: 100, days: 7 },
    { bonus: 250, days: 14 },
    { bonus: 500, days: 21 },
    { bonus: 1000, days: 30 },
    { bonus: 2500, days: 60 },
    { bonus: 5000, days: 90 },
    { bonus: 10_000, days: 180 },
    { bonus: 25_000, days: 365 },
  ];

  const bonus = bonuses
    .filter((b) => streak >= b.days)
    .toSorted((a, b) => b.days - a.days)[0];

  return bonus ? bonus.bonus : 0;
}

// Freeze-related functions
export async function getAvailableFreezesAction({
  userId,
}: {
  userId: string;
}) {
  try {
    const inventory = await prisma.userInventory.findMany({
      include: {
        item: true,
      },
      where: {
        item: {
          type: {
            contains: "freeze",
            mode: "insensitive",
          },
        },
        userId,
      },
    });

    // Extract duration from item name or description
    const freezes = inventory.map((inv) => {
      const match = inv.item.name.match(/(\d+)-day/);
      return {
        duration: match ? Number.parseInt(match[1]) : 1,
        id: inv.id,
        itemId: inv.item.id,
        name: inv.item.name,
      };
    });

    return {
      data: freezes,
      success: true,
    };
  } catch (error) {
    logger.error(error, "Get available freezes action failed");
    return {
      data: [],
      error: "Failed to get freezes",
      success: false,
    };
  }
}

export async function activateFreezeAction({
  userId,
  freezeId,
}: {
  userId: string;
  freezeId: string;
}) {
  try {
    // Get the freeze item from inventory
    const freezeItem = await prisma.userInventory.findUnique({
      include: { item: true },
      where: { id: freezeId },
    });

    if (!freezeItem || freezeItem.userId !== userId) {
      return {
        data: null,
        error: "Freeze item not found",
        success: false,
      };
    }

    // Extract duration from item name
    const match = freezeItem.item.name.match(/(\d+)-day/);
    const duration = match ? Number.parseInt(match[1], 10) : 1;

    // Get current user streak
    const userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      return {
        data: null,
        error: "No streak found",
        success: false,
      };
    }

    // Calculate new frozen until date
    const currentFrozenUntil = userStreak.frozenUntil || new Date();
    const newFrozenUntil = new Date(
      Math.max(currentFrozenUntil.getTime(), Date.now()) +
        duration * 24 * 60 * 60 * 1000
    );

    // Update streak with new frozen date
    await prisma.userStreak.update({
      data: {
        frozenUntil: newFrozenUntil,
      },
      where: { userId },
    });

    // Remove the freeze item from inventory
    await prisma.userInventory.delete({
      where: { id: freezeId },
    });

    // Log the freeze activation
    logger.info(
      {
        duration,
        freezeId,
        newFrozenUntil,
        timestamp: new Date().toISOString(),
        userId,
      },
      "Streak freeze activated"
    );

    // Revalidate dashboard
    revalidatePath(ROUTES.DASHBOARD);

    return {
      data: {
        duration,
        frozenUntil: newFrozenUntil,
      },
      success: true,
    };
  } catch (error) {
    logger.error(error, "Activate freeze action failed");
    return {
      data: null,
      error: "Failed to activate freeze",
      success: false,
    };
  }
}

export async function checkAndApplyFreezeAction({
  userId,
  missedDays,
}: {
  userId: string;
  missedDays: number;
}) {
  try {
    // Get available freezes
    const freezesResult = await getAvailableFreezesAction({ userId });

    if (!freezesResult.success || freezesResult.data.length === 0) {
      return {
        data: null,
        error: "No freezes available",
        success: false,
      };
    }

    // Sort freezes by duration (use shortest first)
    const freezes = freezesResult.data.toSorted(
      (a, b) => a.duration - b.duration
    );

    // Calculate how many days of freeze we need
    let daysToCover = missedDays;
    let totalDuration = 0;
    const usedFreezes: string[] = [];

    for (const freeze of freezes) {
      if (daysToCover <= 0) {
        break;
      }

      // Use this freeze
      usedFreezes.push(freeze.id);
      totalDuration += freeze.duration;
      daysToCover -= freeze.duration;
    }

    if (daysToCover > 0) {
      return {
        data: null,
        error: "Not enough freeze days available",
        success: false,
      };
    }

    // Apply all selected freezes
    let newFrozenUntil = new Date();
    for (const freezeId of usedFreezes) {
      const result = await activateFreezeAction({ freezeId, userId });
      if (result.success && result.data) {
        newFrozenUntil = new Date(result.data.frozenUntil);
      }
    }

    return {
      data: {
        freezesUsed: usedFreezes.length,
        frozenUntil: newFrozenUntil,
        totalDuration,
      },
      success: true,
    };
  } catch (error) {
    logger.error(error, "Check and apply freeze action failed");
    return {
      data: null,
      error: "Failed to apply freeze",
      success: false,
    };
  }
}
