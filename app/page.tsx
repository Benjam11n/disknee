"use client";
import { JSX, useEffect, useMemo, useState } from "react";
import rawSeed from "./seed.json";
import { useRouter } from "next/navigation";

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
} from "@/lib/date-utils";

/* ------------------------------- Types ------------------------------- */
type Difficulty = "easy" | "moderate" | "hard";

interface Exercise {
  id: number | string;
  title: string;
  done: boolean;
  estimatedMins?: number;
  difficulty?: Difficulty;
}

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;
  percent: number;
}

interface Appointment {
  id?: string | number;
  start: string;
  doctorName?: string;
  doctorSpecialty?: string;
  locationName?: string;
  locationAddr?: string;
  time?: string;
  date?: string;
  type?: string;
}

interface Plan {
  id?: string | number;
  date: string;
  title?: string;
  when?: string;
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

/* ------------------------------ Seed cast --------------------------- */
const seed = rawSeed as unknown as DashboardData;

/* ------------------------------ Page -------------------------------- */
export default function RehabDashboardPage(): JSX.Element {
  const router = useRouter();
  const { data, loading, setData } = useLocalData(seed);
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
  } = data;

  // Weekly progress
  const weeklyTarget = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    const total = list.length || 1;
    const done = list.filter((e) => e && e.done).length;
    return done / total;
  }, [exercises]);

  // Weekly total estimated minutes
  const weeklyTotalMins = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    return list.reduce((acc, e) => acc + (e.estimatedMins ?? 0), 0);
  }, [exercises]);

  // Overall progress
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
    setNextApptLabel(formatDateTime(nextAppt.start));
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
  const selectedPlans: Plan[] = useMemo(() => {
    const sel = selectedDate ? formatYMD(selectedDate) : null;
    const list: Plan[] = Array.isArray(plans) ? plans : [];
    if (!sel) return list;
    return list.filter((p) => p?.date && formatYMD(new Date(p.date)) === sel);
  }, [plans, selectedDate]);

  // Upcoming appointments for display
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return (Array.isArray(appointments) ? appointments : [])
      .filter((a) => a && new Date(a.start) > now)
      .slice(0, 3)
      .map((a) => ({
        ...a,
        date: a.start.split("T")[0],
        time: a.start.split("T")[1]?.substring(0, 5) || "09:00",
      }));
  }, [appointments]);

  // Handlers
  const toggleExercise = (id: Exercise["id"]) => {
    setData((prev) => ({
      ...prev,
      exercises: (Array.isArray(prev.exercises) ? prev.exercises : []).map(
        (e) => (e?.id === id ? { ...e, done: !e.done } : e)
      ),
    }));
  };

  const openExercise = (id: Exercise["id"]) => router.push(`/exercise/${id}`);

  const handleAddPlan = () => {
    // TODO: Open plan creation dialog
    console.log("Add plan clicked");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        name={patientName}
        nextAppt={nextAppt}
        label="Next Appointment"
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
                onToggle={toggleExercise}
                onOpen={openExercise}
                loading={loading}
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
                    appointment={{
                      date: apt.date!,
                      time: apt.time!,
                      location: apt.locationName,
                      type: apt.doctorSpecialty,
                    }}
                    compact={true}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Leaderboard
            leaderboard={Array.isArray(leaderboard) ? leaderboard : []}
            patientName={patientName}
            showAll={showAllLeaderboard}
            maxItems={5}
          />
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
              onAddPlan={handleAddPlan}
              maxItems={5}
              showAddButton={true}
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
                    {leaderboard.length}
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

/* ----------------------------- Data hook ---------------------------- */
function useLocalData(initial: DashboardData): {
  data: DashboardData;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<DashboardData>>;
} {
  const [loading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardData>(
    () => JSON.parse(JSON.stringify(initial)) as DashboardData
  );
  return { data, loading, setData };
}
