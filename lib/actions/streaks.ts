"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Mood } from "@prisma/client";
import { logger } from "@/lib/logger";
import { ROUTES } from "@/lib/constants/routes";
import { action } from "../handlers/action";
import { GetStreakSchema } from "../validations/streaks-validations";
import { GetStreakParams, StreakData } from "../types/streaks";
import { handleError } from "../handlers/error";
import { startOfDay, addDays } from "@/lib/utils/date-utils";

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
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckInDate: today,
        },
      });
    }

    // Check if already checked in today
    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingCheckIn) {
      return {
        success: false,
        error: "Already checked in today",
        data: null,
      };
    }

    // Check if streak should continue or reset
    const lastCheckInDate = userStreak.lastCheckInDate;
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
        userId,
        missedDays: daysDiff - 1,
      });

      if (freezeResult.success) {
        // Freeze successfully applied
        newStreak++;
        streakBonus = calculateStreakBonus(newStreak);
        freezeApplied = true;
        logger.info(
          {
            userId,
            daysMissed: daysDiff - 1,
            freezesUsed: freezeResult.data?.freezesUsed,
            frozenUntil: freezeResult.data?.frozenUntil,
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
        userId,
        date: today,
        mood,
        points,
      },
    });

    // Update user streak
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckInDate: today,
      },
    });

    // Update user points
    const totalPoints = points + streakBonus;
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: totalPoints,
        },
        streakPoints: {
          increment: streakBonus,
        },
      },
    });

    // Log the check-in
    logger.info(
      {
        userId,
        mood,
        points,
        streakBonus,
        totalPoints,
        newStreak,
        timestamp: new Date().toISOString(),
      },
      "Daily check-in completed"
    );

    // Revalidate dashboard to show updated data
    revalidatePath(ROUTES.DASHBOARD);

    return {
      success: true,
      data: {
        streak: newStreak,
        pointsEarned: totalPoints,
        streakBonus,
        mood,
        freezeApplied,
        frozenUntil: userStreak.frozenUntil,
      },
    };
  } catch (error) {
    logger.error(error, "Check-in action failed");
    return {
      success: false,
      error: "Failed to check in",
      data: null,
    };
  }
}

export async function getUserStreakAction(
  params: GetStreakParams
): Promise<ActionResponse<StreakData>> {
  const validationResult = await action({
    params: params,
    schema: GetStreakSchema,
    authorize: true,
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
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      success: true,
      data: {
        ...userStreak,
        hasCheckedInToday: !!todayCheckIn,
      },
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
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: checkIns,
    };
  } catch (error) {
    logger.error(error, "Get check-in history action failed");
    return {
      success: false,
      error: "Failed to get check-in history",
      data: null,
    };
  }
}

function calculateStreakBonus(streak: number): number {
  const bonuses = [
    { days: 1, bonus: 10 },
    { days: 3, bonus: 30 },
    { days: 7, bonus: 100 },
    { days: 14, bonus: 250 },
    { days: 21, bonus: 500 },
    { days: 30, bonus: 1000 },
    { days: 60, bonus: 2500 },
    { days: 90, bonus: 5000 },
    { days: 180, bonus: 10000 },
    { days: 365, bonus: 25000 },
  ];

  const bonus = bonuses
    .filter((b) => streak >= b.days)
    .sort((a, b) => b.days - a.days)[0];

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
      where: {
        userId,
        item: {
          type: {
            contains: "freeze",
            mode: "insensitive",
          },
        },
      },
      include: {
        item: true,
      },
    });

    // Extract duration from item name or description
    const freezes = inventory.map((inv) => {
      const match = inv.item.name.match(/(\d+)-day/);
      return {
        id: inv.id,
        itemId: inv.item.id,
        name: inv.item.name,
        duration: match ? parseInt(match[1]) : 1,
      };
    });

    return {
      success: true,
      data: freezes,
    };
  } catch (error) {
    logger.error(error, "Get available freezes action failed");
    return {
      success: false,
      error: "Failed to get freezes",
      data: [],
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
      where: { id: freezeId },
      include: { item: true },
    });

    if (!freezeItem || freezeItem.userId !== userId) {
      return {
        success: false,
        error: "Freeze item not found",
        data: null,
      };
    }

    // Extract duration from item name
    const match = freezeItem.item.name.match(/(\d+)-day/);
    const duration = match ? parseInt(match[1]) : 1;

    // Get current user streak
    const userStreak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    if (!userStreak) {
      return {
        success: false,
        error: "No streak found",
        data: null,
      };
    }

    // Calculate new frozen until date
    const currentFrozenUntil = userStreak.frozenUntil || new Date();
    const newFrozenUntil = new Date(
      Math.max(currentFrozenUntil.getTime(), new Date().getTime()) +
        duration * 24 * 60 * 60 * 1000
    );

    // Update streak with new frozen date
    await prisma.userStreak.update({
      where: { userId },
      data: {
        frozenUntil: newFrozenUntil,
      },
    });

    // Remove the freeze item from inventory
    await prisma.userInventory.delete({
      where: { id: freezeId },
    });

    // Log the freeze activation
    logger.info(
      {
        userId,
        freezeId,
        duration,
        newFrozenUntil,
        timestamp: new Date().toISOString(),
      },
      "Streak freeze activated"
    );

    // Revalidate dashboard
    revalidatePath(ROUTES.DASHBOARD);

    return {
      success: true,
      data: {
        duration,
        frozenUntil: newFrozenUntil,
      },
    };
  } catch (error) {
    logger.error(error, "Activate freeze action failed");
    return {
      success: false,
      error: "Failed to activate freeze",
      data: null,
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
        success: false,
        error: "No freezes available",
        data: null,
      };
    }

    // Sort freezes by duration (use shortest first)
    const freezes = freezesResult.data.sort((a, b) => a.duration - b.duration);

    // Calculate how many days of freeze we need
    let daysToCover = missedDays;
    let totalDuration = 0;
    const usedFreezes: string[] = [];

    for (const freeze of freezes) {
      if (daysToCover <= 0) break;

      // Use this freeze
      usedFreezes.push(freeze.id);
      totalDuration += freeze.duration;
      daysToCover -= freeze.duration;
    }

    if (daysToCover > 0) {
      return {
        success: false,
        error: "Not enough freeze days available",
        data: null,
      };
    }

    // Apply all selected freezes
    let newFrozenUntil = new Date();
    for (const freezeId of usedFreezes) {
      const result = await activateFreezeAction({ userId, freezeId });
      if (result.success && result.data) {
        newFrozenUntil = new Date(result.data.frozenUntil);
      }
    }

    return {
      success: true,
      data: {
        frozenUntil: newFrozenUntil,
        freezesUsed: usedFreezes.length,
        totalDuration,
      },
    };
  } catch (error) {
    logger.error(error, "Check and apply freeze action failed");
    return {
      success: false,
      error: "Failed to apply freeze",
      data: null,
    };
  }
}
