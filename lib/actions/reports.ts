"use server";

import { ReviewStatus } from "@prisma/client";
import z from "zod";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { UnauthorizedError } from "@/lib/http-errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { ReportsData } from "@/lib/types/reports";
import { startOfWeekMonday } from "@/lib/utils/date-utils";

import type { ExerciseSessionWithReflection } from "../types/exercise-sessions";

export async function getReportsDataAction(): Promise<
  ActionResponse<ReportsData>
> {
  const validationResult = await action({
    authorize: true,
    params: {},
    schema: z.object({}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { session } = validationResult;

  if (!session?.user?.id) {
    throw new UnauthorizedError("Unauthorized");
  }

  try {
    const sessions = await prisma.exerciseSession.findMany({
      include: { reflection: true },
      orderBy: { startedAt: "desc" },
      where: { userId: session.user.id },
    });

    const weeksMap = new Map<
      string,
      { weekStart: Date; daysMap: Map<string, ExerciseSessionWithReflection[]> }
    >();

    for (const s of sessions) {
      const wk = startOfWeekMonday(s.startedAt);
      const wkKey = wk.toISOString().slice(0, 10);

      if (!weeksMap.has(wkKey)) {
        weeksMap.set(wkKey, { daysMap: new Map(), weekStart: wk });
      }

      const dayKey = s.startedAt.toISOString().slice(0, 10);
      const entry = weeksMap.get(wkKey)!;

      if (!entry.daysMap.has(dayKey)) {
        entry.daysMap.set(dayKey, []);
      }

      entry.daysMap.get(dayKey)!.push(s);
    }

    const weeks = [...weeksMap.values()]
      .map((w) => {
        const days = [...w.daysMap.entries()]
          .map(([dayIso, sessions]) => ({
            date: dayIso,
            items: sessions.map((ss) => ({
              comments: ss.reflection?.feedback ?? null,
              endedOn: ss.endedAt ? ss.endedAt.toISOString() : null,
              fatigue: ss.reflection?.fatigue ?? null,
              points: ss.pointsEarned ?? 0,
              satisfaction: ss.reflection?.rating ?? null,
              status: ss.endedAt ? "Completed" : "Incomplete",
              title: ss.exerciseTitle ?? "Exercise",
            })),
          }))
          .toSorted((a, b) => +new Date(b.date) - +new Date(a.date));

        const allItems = days.flatMap((d) => d.items);
        const totalExercises = allItems.length;
        const avgSatisfaction =
          totalExercises > 0
            ? +(
                allItems.reduce((s, it) => s + (it.satisfaction || 0), 0) /
                totalExercises
              ).toFixed(1)
            : null;
        const avgFatigue =
          totalExercises > 0
            ? +(
                allItems.reduce((s, it) => s + (it.fatigue || 0), 0) /
                totalExercises
              ).toFixed(1)
            : null;
        const totalPoints = allItems.reduce((s, it) => s + (it.points || 0), 0);

        return {
          avgFatigue,
          avgSatisfaction,
          days,
          totalExercises,
          totalPoints,
          weekStart: w.weekStart.toISOString(),
        };
      })
      .toSorted((a, b) => +new Date(b.weekStart) - +new Date(a.weekStart));

    const weekStarts = weeks.map((w) => new Date(w.weekStart));
    const weekReports = await prisma.weekReport.findMany({
      where: { userId: session.user.id, weekStart: { in: weekStarts } },
    });
    const weekReportByKey = new Map(
      weekReports.map((r) => [r.weekStart.toISOString().slice(0, 10), r])
    );

    const weeksWithMeta = weeks.map((w) => {
      const key = new Date(w.weekStart).toISOString().slice(0, 10);
      const wr = weekReportByKey.get(key);
      return {
        ...w,
        feedback: wr?.feedback ?? null,
        reviewed: wr?.status ?? ReviewStatus.NOT_SENT,
      };
    });

    return { data: { weeksWithMeta }, success: true };
  } catch (error) {
    logger.error(error, "Failed to get reports data");
    throw error;
  }
}
