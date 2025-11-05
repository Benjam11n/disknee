"use client";

import { JSX } from "react";

import { Leaderboard } from "@/components/features/dashboard/leaderboard";
import { CalendarAndPlans } from "@/components/features/dashboard/calendar-and-plans";
import { ExerciseProgressCard } from "@/components/features/dashboard/exercise-progress-card";
import { UpcomingAppointments } from "@/components/features/dashboard/upcoming-appointments";
import { ProgressSummary } from "@/components/features/dashboard/progress-summary";
import { DashboardLayout } from "@/components/features/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardCalculations } from "@/lib/hooks/use-dashboard-calculations";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import {
  Appointment,
  Exercise,
  leaderboardByScore,
  Plan,
} from "@prisma/client";

interface DashboardData {
  patientName: string;
  exercises: Exercise[];
  leaderboard: leaderboardByScore[];
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

export function DashboardClient({
  initialData,
}: DashboardClientProps): JSX.Element {
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

  const { weeklyTarget, weeklyTotalMins, overallTarget } =
    useDashboardCalculations({
      exercises,
      overallPercent,
      programWeeks,
      weeksCompleted,
    });

  const {
    showAllLeaderboard,
    setShowAllLeaderboard,
    monthMatrix,
    monthLabel,
    today,
    selectedDate,
    setSelectedDate,
    apptDays,
    planDays,
    selectedPlans,
    upcomingAppointments,
    patientRank,
  } = useDashboardData({
    appointments,
    plans,
    leaderboard,
    patientName,
  });

  const leftColumn = (
    <>
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
    </>
  );

  const rightColumn = (
    <>
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
    </>
  );

  return <DashboardLayout leftColumn={leftColumn} rightColumn={rightColumn} />;
}
