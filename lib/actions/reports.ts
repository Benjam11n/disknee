"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ExerciseSession, Reflection } from "@prisma/client";
import { startOfWeekMonday } from "@/lib/utils/date-utils";
import { logger } from "@/lib/logger";

type ExerciseSessionWithReflection = ExerciseSession & {
  reflection: Reflection | null;
};

interface ReportsData {
  weeksWithMeta: Array<{
    weekStart: string;
    days: Array<{
      date: string;
      items: Array<{
        title: string;
        status: string;
        endedOn: string | null;
        satisfaction: number | null;
        fatigue: number | null;
        comments: string | null;
        points: number;
      }>;
    }>;
    totalExercises: number;
    avgSatisfaction: number | null;
    avgFatigue: number | null;
    totalPoints: number;
    reviewed: string;
    feedback: string | null;
  }>;
}

export async function getReportsDataAction(): Promise<ReportsData> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const sessions = (await prisma.exerciseSession.findMany({
      where: { userId: session.user.id },
      include: { reflection: true },
      orderBy: { startedAt: "desc" },
    })) as ExerciseSessionWithReflection[];

    // Group sessions into weeks -> days -> items
    const weeksMap = new Map<
      string,
      { weekStart: Date; daysMap: Map<string, ExerciseSessionWithReflection[]> }
    >();

    for (const s of sessions) {
      const wk = startOfWeekMonday(s.startedAt);
      const wkKey = wk.toISOString().slice(0, 10);

      if (!weeksMap.has(wkKey)) {
        weeksMap.set(wkKey, { weekStart: wk, daysMap: new Map() });
      }

      const dayKey = s.startedAt.toISOString().slice(0, 10);
      const entry = weeksMap.get(wkKey)!;

      if (!entry.daysMap.has(dayKey)) {
        entry.daysMap.set(dayKey, []);
      }

      entry.daysMap.get(dayKey)!.push(s);
    }

    const weeks = Array.from(weeksMap.values())
      .map((w) => {
        const days = Array.from(w.daysMap.entries())
          .map(([dayIso, sessions]) => ({
            date: dayIso,
            items: sessions.map((ss) => ({
              title: ss.exerciseTitle ?? "Exercise",
              status: ss.endedAt ? "Completed" : "Incomplete",
              endedOn: ss.endedAt ? ss.endedAt.toISOString() : null,
              satisfaction: ss.reflection?.rating ?? null,
              fatigue: ss.reflection?.fatigue ?? null,
              comments: ss.reflection?.feedback ?? null,
              points: ss.pointsEarned ?? 0,
            })),
          }))
          .sort((a, b) => +new Date(b.date) - +new Date(a.date));

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
          weekStart: w.weekStart.toISOString(),
          days,
          totalExercises,
          avgSatisfaction,
          avgFatigue,
          totalPoints,
        };
      })
      .sort((a, b) => +new Date(b.weekStart) - +new Date(a.weekStart));

    // Attach WeekReport metadata if present
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
        reviewed: wr?.status ?? "NOT_SENT",
        feedback: wr?.feedback ?? null,
      };
    });

    return { weeksWithMeta };
  } catch (error) {
    logger.error(error, "Failed to get reports data");
    throw error;
  }
}