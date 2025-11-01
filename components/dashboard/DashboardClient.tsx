"use client";

import { JSX, useMemo, useState } from "react";

import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { CalendarAndPlans } from "@/components/dashboard/CalendarAndPlans";
import { ExerciseProgressCard } from "@/components/dashboard/ExerciseProgressCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { ProgressSummary } from "@/components/dashboard/ProgressSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMonthMatrix, formatYMD, formatTime } from "@/lib/date-utils";
import { Appointment, Exercise, Plan } from "@prisma/client";
import { PlanWithExercises } from "@/lib/types/plans";

// todo
interface LeaderboardEntry {
  rank: number;
  name: string;
  weeks: number;
  accuracyPercentage: number;
  score: number;
}

interface DashboardData {
  patientName: string;
  exercises: Exercise[];
  leaderboard: LeaderboardEntry[];
  appointments: Appointment[];
  plans: Plan[];
  overallPercent?: number;
  programWeeks?: number;
  weeksCompleted?: number;
  Appointment?: Appointment;
}

interface DashboardClientProps {
  initialData: DashboardData;
}

// todo: break this component down for maintainability
export function DashboardClient({
  initialData,
}: DashboardClientProps): JSX.Element {
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

  const {
    patientName,
    exercises,
    leaderboard,
    appointments,
    plans,
    overallPercent,
    programWeeks = 10,
    weeksCompleted = 0,
  } = initialData;

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
        time: formatTime(
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

  return (
    <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
      {/* Left Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Exercise Progress */}
        <ExerciseProgressCard
          exercises={exercises}
          weeklyTarget={weeklyTarget}
          weeklyTotalMins={weeklyTotalMins}
        />

        {/* Upcoming Appointments */}
        <UpcomingAppointments appointments={upcomingAppointments} />

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Leaderboard
              leaderboard={Array.isArray(leaderboard) ? leaderboard : []}
              patientName={patientName}
              showAll={showAllLeaderboard}
              maxItems={5}
            />
            {leaderboard.length > 5 && (
              <button
                onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
                className="mt-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {showAllLeaderboard ? "Show Less" : "Show All"}
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Overall Progress Summary */}
        <ProgressSummary
          overallTarget={overallTarget}
          weeksCompleted={weeksCompleted}
          programWeeks={programWeeks}
          patientRank={patientRank}
        />

        {/* Progress and Calendar */}
        <CalendarAndPlans
          monthMatrix={monthMatrix}
          monthLabel={monthLabel}
          today={today}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          apptDays={apptDays}
          planDays={planDays}
          selectedPlans={selectedPlans}
          ringProgress={overallTarget}
        />
      </div>
    </div>
  );
}
