import { useMemo, useState } from "react";
import { Appointment, Plan, leaderboardByScore } from "@prisma/client";
import { buildMonthMatrix, formatYMD, formatTime24Hour } from "@/lib/utils/date-utils";
import { PlanWithExercises } from "@/lib/types/plans";

interface UseDashboardDataProps {
  appointments: Appointment[];
  plans: Plan[];
  leaderboard: leaderboardByScore[];
  patientName: string;
}

export function useDashboardData({
  appointments,
  plans,
  leaderboard,
  patientName,
}: UseDashboardDataProps) {
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

  // Calendar
  const today = useMemo(() => new Date(), []);
  const { monthMatrix, monthLabel } = useMemo(
    () => buildMonthMatrix(today),
    [today]
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Highlight sets
  const apptDays = useMemo<Set<string>>(
    () =>
      new Set(
        (Array.isArray(appointments) ? appointments : [])
          .filter(Boolean)
          .map((a) => formatYMD(new Date(a.start)))
      ),
    [appointments]
  );
  const planDays = useMemo<Set<string>>(
    () =>
      new Set(
        (Array.isArray(plans) ? plans : [])
          .filter(Boolean)
          .map((p) => formatYMD(new Date(p.date)))
      ),
    [plans]
  );

  // Plans filtered by selected date
  const selectedPlans: PlanWithExercises[] = useMemo(() => {
    const sel = selectedDate ? formatYMD(selectedDate) : null;

    if (!sel) return [];
    return (Array.isArray(plans) ? plans : []).filter(
      (p) => p?.date && formatYMD(new Date(p.date)) === sel
    );
  }, [plans, selectedDate]) as PlanWithExercises[];

  // Upcoming appointments for display
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return (Array.isArray(appointments) ? appointments : [])
      .filter((a) => a && new Date(a.start) > now)
      .slice(0, 3)
      .map((a) => ({
        ...a,
        date: formatYMD(new Date(a.start)),
        time: formatTime24Hour(
          a.start instanceof Date ? a.start.toISOString() : a.start
        ),
      }));
  }, [appointments]);

  // Find patient rank from leaderboard
  const patientRank = useMemo(() => {
    const patientEntry = leaderboard.find(
      (entry) => entry.name === patientName
    );
    return patientEntry?.rank || leaderboard.length + 1;
  }, [leaderboard, patientName]);

  return {
    showAllLeaderboard,
    setShowAllLeaderboard,
    today,
    monthMatrix,
    monthLabel,
    selectedDate,
    setSelectedDate,
    apptDays,
    planDays,
    selectedPlans,
    upcomingAppointments,
    patientRank,
  };
}
