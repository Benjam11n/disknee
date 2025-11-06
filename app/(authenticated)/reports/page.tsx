import ReportsClient from "./reports-client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { ExerciseSession, Reflection } from "@prisma/client";
import { startOfWeekMonday } from "@/lib/utils/date-utils";

type ExerciseSessionWithReflection = ExerciseSession & {
  reflection: Reflection | null;
};

export default async function ReportsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  // todo: create server action for this
  const sessions = (await prisma.exerciseSession.findMany({
    where: { userId: session.user.id },
    include: { reflection: true },
    orderBy: { startedAt: "desc" },
  })) as ExerciseSessionWithReflection[];

  // group sessions into weeks -> days -> items
  const weeksMap = new Map<
    string,
    { weekStart: Date; daysMap: Map<string, ExerciseSessionWithReflection[]> }
  >();
  for (const s of sessions) {
    const wk = startOfWeekMonday(s.startedAt);
    const wkKey = wk.toISOString().slice(0, 10);
    if (!weeksMap.has(wkKey))
      weeksMap.set(wkKey, { weekStart: wk, daysMap: new Map() });

    const dayKey = s.startedAt.toISOString().slice(0, 10);
    const entry = weeksMap.get(wkKey)!;
    if (!entry.daysMap.has(dayKey)) entry.daysMap.set(dayKey, []);
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

  // attach WeekReport metadata if present
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

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Weekly Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your exercise history and clinician feedback.
        </p>
      </div>

      <div className="space-y-4">
        <ReportsClient initialWeeks={weeksWithMeta} />
      </div>
    </main>
  );
}
