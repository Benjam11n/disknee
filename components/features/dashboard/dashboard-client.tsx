"use client";

import { JSX } from "react";

import { Leaderboard } from "@/components/features/dashboard/leaderboard";
import { CalendarAndPlans } from "@/components/features/dashboard/calendar-and-plans";
import { ExerciseProgress } from "@/components/features/dashboard/exercise-progress";
import { UpcomingAppointments } from "@/components/features/dashboard/upcoming-appointments";
import { ProgressJourney } from "@/components/features/dashboard/progress-journey";
import { HeroSection } from "@/components/features/dashboard/hero-section";
import { DashboardLayout } from "@/components/features/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardCalculations } from "@/lib/hooks/use-dashboard-calculations";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { StreakDisplay } from "@/components/features/streak/streak-display";
import { DailyCheckInDialog } from "@/components/features/streak/daily-check-in-dialog";
import { useState, useEffect } from "react";
import {
  Appointment,
  Exercise,
  leaderboardByScore,
  Plan,
  ShopItem,
} from "@prisma/client";
import { logger } from "@/lib/logger";
import { StreakData } from "@/lib/types/streaks";
import { ROUTES } from "@/lib/constants/routes";
import { useRouter } from "next/navigation";

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
  userPoints?: number;
  equippedItems?: ShopItem[];
  streakData?: StreakData;
}

interface DashboardClientProps {
  initialData: DashboardData;
  userId: string;
}

export function DashboardClient({
  initialData,
  userId,
}: DashboardClientProps): JSX.Element {
  const router = useRouter();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);

  const {
    patientName,
    exercises,
    leaderboard,
    appointments,
    plans,
    overallPercent,
    programWeeks = 10,
    weeksCompleted = 0,
    // todo: these are unused
    userPoints = 0,
    equippedItems = [],
    streakData,
  } = initialData;

  // Show check-in dialog if user hasn't checked in today
  useEffect(() => {
    if (streakData && !streakData.hasCheckedInToday) {
      // todo:
      // You can add logic here to show the dialog automatically
      // or wait for user interaction
    }
  }, [streakData]);

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
      {/* Streak Display - More prominent */}
      {streakData && (
        <StreakDisplay
          currentStreak={streakData.currentStreak}
          longestStreak={streakData.longestStreak}
          lastCheckIn={streakData.lastCheckInDate || undefined}
          frozenUntil={streakData.frozenUntil || undefined}
          userId={userId}
          onCheckInClick={() => setIsCheckInDialogOpen(true)}
          canCheckIn={!streakData.hasCheckedInToday}
          onFreezeActivated={() => {
            // Refresh the page to show updated freeze status
            window.location.reload();
          }}
        />
      )}

      {/* Enhanced Exercise Progress */}
      <ExerciseProgress
        exercises={exercises}
        weeklyTarget={weeklyTarget}
        weeklyTotalMins={weeklyTotalMins}
        onStartExercise={(exerciseId) => {
          router.push(ROUTES.CALL.detail(exerciseId));
        }}
      />

      <UpcomingAppointments appointments={upcomingAppointments} />
    </>
  );

  const rightColumn = (
    <>
      {/* Progress Journey */}
      <ProgressJourney
        overallTarget={overallTarget}
        weeksCompleted={weeksCompleted}
        programWeeks={programWeeks}
        patientRank={patientRank}
        userPoints={userPoints}
      />

      {/* Calendar and Plans */}
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

      {/* Leaderboard - Smaller version */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Leaderboard
            leaderboard={Array.isArray(leaderboard) ? leaderboard : []}
            patientName={patientName}
            showAll={false}
            maxItems={3}
          />
          {leaderboard.length > 3 && (
            <button
              onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
              className="mt-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full"
            >
              View Full Leaderboard →
            </button>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <>
      <HeroSection
        patientName={patientName}
        streakCount={streakData?.currentStreak}
        userPoints={userPoints}
        completionRate={overallTarget}
        equippedItems={equippedItems}
      />

      <DashboardLayout leftColumn={leftColumn} rightColumn={rightColumn} />

      {/* Daily Check-In Dialog */}
      <DailyCheckInDialog
        isOpen={isCheckInDialogOpen}
        onClose={() => setIsCheckInDialogOpen(false)}
        userId={userId}
        onCheckInComplete={(mood, points, encouragement) => {
          logger.info({ mood, points, encouragement }, "Checked in:");
          // Refresh the page or update streak data
          window.location.reload();
        }}
      />
    </>
  );
}
