import type { Exercise } from "@prisma/client";
import { useMemo } from "react";

interface UseDashboardCalculationsProps {
  exercises: Exercise[];
  overallPercent?: number;
  programWeeks?: number;
  weeksCompleted?: number;
}

export function useDashboardCalculations({
  exercises,
  overallPercent,
  programWeeks = 10,
  weeksCompleted = 0,
}: UseDashboardCalculationsProps) {
  // Weekly progress
  const weeklyTarget = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    const total = list.length || 1;
    const done = list.filter((e) => e && e.done).length;
    return done / total;
  }, [exercises]);

  const weeklyTotalMins = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    return list.reduce((acc, e) => acc + (e.estimatedMins ?? 0), 0);
  }, [exercises]);

  const computedOverall = useMemo<number>(() => {
    const weeks = Math.max(1, programWeeks);
    const base = Math.max(0, Math.min(weeks, weeksCompleted));
    return Math.max(0, Math.min(1, (base + weeklyTarget) / weeks));
  }, [programWeeks, weeksCompleted, weeklyTarget]);

  const overallTarget = useMemo<number>(() => {
    if (typeof overallPercent === "number" && !Number.isNaN(overallPercent)) {
      return Math.max(0, Math.min(1, overallPercent / 100));
    }
    return computedOverall;
  }, [overallPercent, computedOverall]);

  return {
    overallTarget,
    weeklyTarget,
    weeklyTotalMins,
  };
}
