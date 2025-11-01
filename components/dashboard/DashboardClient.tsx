"use client";

import { JSX, useEffect, useMemo, useState } from "react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExerciseList } from "@/components/dashboard/ExerciseList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Calendar } from "@/components/dashboard/Calendar";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanningList } from "@/components/dashboard/PlanningList";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import {
  buildMonthMatrix,
  formatYMD,
  getNextAppointment,
  formatDateTime,
  formatTime,
} from "@/lib/date-utils";
import { Appointment, Exercise, Plan } from "@prisma/client";
import { PlanWithExercises } from "@/lib/types/plans";

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;
  percent: number;
}

interface DashboardData {
  patientName: string;
  exercises: Exercise[];
  leaderboard: LeaderboardRow[];
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

  // Animate outer ring
  const [ringProgress, setRingProgress] = useState<number>(0);
  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    const from = ringProgress;
    const to = overallTarget;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setRingProgress(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [overallTarget, ringProgress]);

  // Next appointment
  const [nextApptLabel, setNextApptLabel] = useState<string>("—");
  const nextAppt = useMemo(
    () => getNextAppointment(Array.isArray(appointments) ? appointments : []),
    [appointments]
  );

  useEffect(() => {
    if (!nextAppt) return setNextApptLabel("—");

    setNextApptLabel(
      formatDateTime(
        nextAppt.start instanceof Date
          ? nextAppt.start.toISOString()
          : nextAppt.start
      )
    );
  }, [nextAppt]);

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

  const handleAddPlan = () => {
    // TODO: Open plan creation dialog
    console.log("Add plan clicked");
  };

  // Find patient rank from leaderboard
  const patientRank = useMemo(() => {
    const patientEntry = leaderboard.find(
      (entry) => entry.name === patientName
    );
    return patientEntry?.rank || leaderboard.length + 1;
  }, [leaderboard, patientName]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        name={patientName}
        nextAppt={nextAppt}
        label={nextApptLabel}
      />

      <main className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exercise Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Exercises</CardTitle>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {Math.round(weeklyTarget * 100)}% complete
                </div>
                <div className="text-xs text-muted-foreground">
                  Estimated time: {weeklyTotalMins} minutes
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ExerciseList
                exercises={Array.isArray(exercises) ? exercises : []}
                pillPercent={Math.round(weeklyTarget * 100)}
                weeklyTotalMins={weeklyTotalMins}
              />
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.map((apt, idx) => (
                  <AppointmentCard
                    key={apt.id || idx}
                    appointment={apt}
                    compact={true}
                  />
                ))}
              </CardContent>
            </Card>
          )}

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
          {/* Progress and Calendar */}
          <Card className="p-6">
            <div className="relative flex justify-center mb-6">
              <ProgressRing
                progress={ringProgress}
                size={250}
                strokeWidth={16}
                showPercentage={true}
              />
            </div>

            {/* Calendar */}
            <Calendar
              monthMatrix={monthMatrix}
              monthLabel={monthLabel}
              today={today}
              selectedDate={selectedDate}
              apptDays={apptDays}
              planDays={planDays}
              onSelectDate={setSelectedDate}
            />

            <Separator className="my-4" />

            {/* Selected Date Plans */}
            <PlanningList
              plans={selectedPlans}
              maxItems={5}
              showAddButton={false}
            />
          </Card>

          {/* Overall Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(overallTarget * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {weeksCompleted}/{programWeeks}
                  </div>
                  <div className="text-sm text-muted-foreground">Weeks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    #{patientRank}
                  </div>
                  <div className="text-sm text-muted-foreground">Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
