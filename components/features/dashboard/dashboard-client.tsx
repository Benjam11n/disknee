"use client";

import type {
  Appointment,
  Exercise,
  leaderboardByScore,
  Plan,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState, useEffect } from "react";

import { CalendarAndPlans } from "@/components/features/dashboard/calendar-and-plans";
import { ExerciseProgress } from "@/components/features/dashboard/exercise-progress";
import { HeroSection } from "@/components/features/dashboard/hero-section";
import { ProgressJourney } from "@/components/features/dashboard/progress-journey";
import { UpcomingAppointments } from "@/components/features/dashboard/upcoming-appointments";
import { DailyCheckInDialog } from "@/components/features/streak/daily-check-in-dialog";
import { StreakDisplay } from "@/components/features/streak/streak-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants/routes";
import { useDashboardCalculations } from "@/lib/hooks/use-dashboard-calculations";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { logger } from "@/lib/logger";
import type { StreakData } from "@/lib/types/streaks";

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
    userPoints = 0,
    streakData,
  } = initialData;

  // Show check-in dialog if user hasn't checked in today
  useEffect(() => {
    if (streakData && !streakData.hasCheckedInToday) {
      // Auto-show dialog after a short delay to let user settle in
      const timer = setTimeout(() => {
        setIsCheckInDialogOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
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
    leaderboard,
    patientName,
    plans,
  });

  return (
    <>
      <HeroSection
        patientName={patientName}
        streakCount={streakData?.currentStreak}
        userPoints={userPoints}
        completionRate={overallTarget}
      />

      <div className="w-full">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-border/40 rounded-none w-full justify-start h-auto p-0 gap-8">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent text-sm font-medium tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 -mb-px transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="rounded-none border-b-2 border-transparent text-sm font-medium tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 -mb-px transition-colors"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="rounded-none border-b-2 border-transparent text-sm font-medium tracking-wide text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 -mb-px transition-colors"
            >
              Journey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {streakData && (
              <StreakDisplay
                currentStreak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
                lastCheckIn={streakData.lastCheckInDate || undefined}
                frozenUntil={streakData.frozenUntil || undefined}
                userId={userId}
                onFreezeActivated={() => {
                  window.location.reload();
                }}
              />
            )}
            <ExerciseProgress
              exercises={exercises}
              weeklyTarget={weeklyTarget}
              weeklyTotalMins={weeklyTotalMins}
              onStartExercise={(exerciseId) => {
                router.push(ROUTES.CALL_DETAIL(exerciseId));
              }}
            />
            <UpcomingAppointments appointments={upcomingAppointments} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-0">
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
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-0">
            <ProgressJourney
              overallTarget={overallTarget}
              weeksCompleted={weeksCompleted}
              programWeeks={programWeeks}
              patientRank={patientRank}
              userPoints={userPoints}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Daily Check-In Dialog */}
      <DailyCheckInDialog
        isOpen={isCheckInDialogOpen}
        onClose={() => setIsCheckInDialogOpen(false)}
        userId={userId}
        onCheckInComplete={(mood, points, encouragement) => {
          logger.info({ encouragement, mood, points }, "Checked in:");
          window.location.reload();
        }}
      />
    </>
  );
}
