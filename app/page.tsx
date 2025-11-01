"use client";
import { JSX, useEffect, useMemo, useState } from "react";
import rawSeed from "./seed.json"; // tsconfig: { "resolveJsonModule": true }
import { useRouter } from "next/navigation";

/* ------------------------------- Types ------------------------------- */
type Difficulty = "easy" | "moderate" | "hard";

interface Exercise {
  id: number | string;
  title: string;
  done: boolean;          // counts toward weekly progress
  estimatedMins?: number; // duration hint
  difficulty?: Difficulty; // NEW: easy | moderate | hard
}

interface LeaderboardRow {
  rank: number;
  name: string;
  weeks: number;  // kept in seed; hidden in UI
  percent: number;
}

interface Appointment {
  id?: string | number;
  start: string; // ISO date string
}

interface Plan {
  id?: string | number;
  date: string;  // ISO date string (date or datetime)
  title?: string;
  when?: string;
}

interface DashboardData {
  patientName: string;
  exercises: Exercise[]; // weekly items
  leaderboard: LeaderboardRow[];
  appointments: Appointment[];
  plans: Plan[]; // scheduled sessions by date
  overallPercent?: number; // optional override 0-100
  programWeeks?: number;   // default 10
  weeksCompleted?: number; // fully completed weeks
  Appointment?: Appointment;
}

interface Appointment {
  id?: string | number;
  start: string;              // ISO date string
  doctorName?: string;        // e.g. "Dr Emily Smith"
  doctorSpecialty?: string;   // e.g. "Sports Physiotherapist"
  locationName?: string;      // e.g. "MotionWorks Physio"
  locationAddr?: string;      // e.g. "Level 3, 88 George St, Sydney NSW"
}

/* ------------------------------ Seed cast --------------------------- */
const seed = rawSeed as unknown as DashboardData;

/* ------------------------ Small UI helpers -------------------------- */
function difficultyStyles(d?: Difficulty) {
  // Tailwind utility sets for tint + border + badge
  switch (d) {
    case "easy":
      return {
        row: "bg-emerald-50 border-emerald-200",
        box: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-300"
      };
    case "moderate":
      return {
        row: "bg-amber-50 border-amber-200",
        box: "border-amber-500",
        badge: "bg-amber-100 text-amber-800 border border-amber-300"
      };
    case "hard":
      return {
        row: "bg-rose-50 border-rose-200",
        box: "border-rose-500",
        badge: "bg-rose-100 text-rose-800 border border-rose-300"
      };
    default:
      return {
        row: "bg-white border-gray-300",
        box: "border-gray-800",
        badge: "bg-gray-100 text-gray-700 border border-gray-300"
      };
  }
}

/* ------------------------------ Page -------------------------------- */
export default function RehabDashboardPage(): JSX.Element {
  const router = useRouter();

  const { data, loading, setData } = useLocalData(seed);
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

  // Weekly progress (left pill)
  const weeklyTarget = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    const total = list.length || 1;
    const done = list.filter((e) => e && e.done).length;
    return done / total; // 0..1
  }, [exercises]);

  // Weekly total estimated minutes
  const weeklyTotalMins = useMemo<number>(() => {
    const list = Array.isArray(exercises) ? exercises : [];
    return list.reduce((acc, e) => acc + (e.estimatedMins ?? 0), 0);
  }, [exercises]);

  // Overall progress (outer ring) — 10-week default; full week done = +10%
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
  }, [overallTarget]);

  // Next appointment label (client-only)
  const [nextApptLabel, setNextApptLabel] = useState<string>("—");
  

  useEffect(() => {
    const next = getNextAppointment(Array.isArray(appointments) ? appointments : []);
    if (!next) return setNextApptLabel("—");
    const label = new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(next.start));
    setNextApptLabel(label);
  }, [appointments]);

  // Calendar
  const today = new Date();
  const { monthMatrix, monthLabel } = useMemo(() => buildMonthMatrix(today), [today]);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Highlight sets
  const apptDays = useMemo<Set<string>>(
    () => new Set((Array.isArray(appointments) ? appointments : []).filter(Boolean).map((a) => formatYMD(new Date(a.start)))),
    [appointments]
  );
  const planDays = useMemo<Set<string>>(
    () => new Set((Array.isArray(plans) ? plans : []).filter(Boolean).map((p) => formatYMD(new Date(p.date)))),
    [plans]
  );

  // Plans filtered by selected date
  const selectedPlans: Plan[] = useMemo(() => {
    const sel = selectedDate ? formatYMD(selectedDate) : null;
    const list: Plan[] = Array.isArray(plans) ? plans : [];
    if (!sel) return list;
    return list.filter((p) => p?.date && formatYMD(new Date(p.date)) === sel);
  }, [plans, selectedDate]);

  // Handlers (local optimistic toggle ONLY — no fetch)
  const toggleExercise = (id: Exercise["id"]) => {
    setData((prev) => ({
      ...prev,
      exercises: (Array.isArray(prev.exercises) ? prev.exercises : []).map((e) =>
        e?.id === id ? { ...e, done: !e.done } : e
      ),
    }));
  };
  const nextAppt = useMemo(() => getNextAppointment(Array.isArray(appointments) ? appointments : []), [appointments]);
  const openExercise = (id: Exercise["id"]) => router.push(`/exercise/${id}`);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <TopBar
  label={nextApptLabel}
  name={patientName}
  nextAppt={nextAppt}
  primaryDoctorText={
    nextAppt?.doctorName && nextAppt?.doctorSpecialty
      ? `${nextAppt.doctorName} — ${nextAppt.doctorSpecialty}`
      : undefined
  }
/>

      <main className="px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1200px] mx-auto">
        <LeftDashboard
          loading={loading}
          exercises={Array.isArray(exercises) ? exercises : []}
          onToggle={toggleExercise}
          onOpen={openExercise}
          pillPercent={Math.round(weeklyTarget * 100)}
          weeklyTotalMins={weeklyTotalMins}
          leaderboard={Array.isArray(leaderboard) ? leaderboard : []}
          patientName={patientName}
        />

        <section className="py-6 lg:col-span-7 flex justify-center">
          <ProgressCircleCard
            progress={ringProgress}
            monthMatrix={monthMatrix}
            monthLabel={monthLabel}
            today={today}
            apptDays={apptDays}
            planDays={planDays}
            plans={Array.isArray(plans) ? plans : []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedPlans={selectedPlans}
          />
        </section>
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
  const [data, setData] = useState<DashboardData>(() => JSON.parse(JSON.stringify(initial)) as DashboardData);
  return { data, loading, setData };
}

/* ----------------------------- Top Bar ------------------------------ */
function TopBar({
  label,
  name,
  nextAppt,
  primaryDoctorText,
}: {
  label: string;
  name: string;
  nextAppt?: Appointment | null;
  primaryDoctorText?: string;
}): JSX.Element {
  const patientName = name || "";

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="mx-auto grid grid-cols-3 items-center gap-6 px-6 py-3 max-w-[1200px]">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-900" />
          <h1 className="text-xl font-semibold tracking-tight">DisKnee</h1>
        </div>

        {/* Middle: next appointment with hover dropdown */}
        <div className="hidden md:flex items-center justify-center gap-3 text-sm relative group">
          <span className="text-gray-500">Next appointment</span>

          {/* Badge that triggers the dropdown */}
          <span
            suppressHydrationWarning
            className="rounded-full border border-gray-300 px-3 py-1 font-medium bg-white cursor-default group-hover:border-gray-400 transition"
          >
            {label || "—"}
          </span>

          {/* Hover card */}
          {nextAppt && (
            <div
              className="absolute top-[110%] left-1/2 -translate-x-1/2 min-w-[260px] rounded-md border border-gray-200 bg-white shadow-lg p-3 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition"
              role="tooltip"
            >
              <div className="text-[13px] leading-5">
                <div className="font-semibold">
                  {nextAppt.doctorName || "Doctor TBD"}
                </div>
                {nextAppt.doctorSpecialty && (
                  <div className="text-gray-600">{nextAppt.doctorSpecialty}</div>
                )}
                {(nextAppt.locationName || nextAppt.locationAddr) && (
                  <div className="mt-2">
                    <div className="text-gray-800">{nextAppt.locationName}</div>
                    <div className="text-gray-600">{nextAppt.locationAddr}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: patient name + doctor-in-charge */}
        <div className="flex items-center justify-end gap-2">
          <div
            className="max-w-[220px] truncate text-right font-medium"
            title={patientName}
          >
            {patientName}
          </div>

          {primaryDoctorText && (
            <span
              className="hidden sm:inline-flex max-w-[300px] truncate rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700"
              title={primaryDoctorText}
            >
              {primaryDoctorText}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}


/* --------------------------- Left Dashboard ------------------------- */
function LeftDashboard({
  loading,
  exercises,
  onToggle,
  onOpen,
  pillPercent,
  weeklyTotalMins,
  leaderboard,
  patientName,
}: {
  loading: boolean;
  exercises: Exercise[];
  onToggle: (id: Exercise["id"]) => void;
  onOpen: (id: Exercise["id"]) => void;
  pillPercent: number;
  weeklyTotalMins: number;
  leaderboard: LeaderboardRow[];
  patientName: string;
}): JSX.Element {
  return (
    <section className="lg:col-span-5">
      <div className="rounded-xl bg-gray-200/90 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Dashboard — Exercises</h2>

        {/* Progress pill (WEEKLY) — thinner */}
        <div className="mb-1">
          <div className="relative h-7 w-full max-w-md rounded-full border border-gray-400 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-green-200" style={{ width: `${pillPercent}%` }} />
            <div className="relative z-10 flex h-full items-center justify-center text-[13px] font-semibold">
              {pillPercent}% (week)
            </div>
          </div>
        </div>
          <div className="mb-4 text-[12px] text-gray-700">
            Estimated this week: <strong className="font-bold">{weeklyTotalMins} min</strong>
          </div>
        {/* Compact Exercise list with difficulty colour accents */}
        <ul className="space-y-2">
          {loading && <li className="animate-pulse h-10 rounded-lg bg-white/70" />}
          {exercises.map((ex) => {
            const styles = difficultyStyles(ex.difficulty);
            return (
              <li
                key={ex.id}
                className={`flex items-center justify-between rounded-md border ${styles.row} px-2.5 py-2`}
              >
                <div className="flex items-center gap-2">
                  {/* smaller toggle box; coloured border by difficulty */}
                  <button
                    aria-label={ex.done ? "Mark as not done" : "Mark as done"}
                    onClick={() => onToggle(ex.id)}
                    className={`grid h-5 w-5 place-items-center rounded border-2 transition ${ex.done ? `${styles.box} bg-current text-white` : styles.box}`}
                    style={ex.done ? { color: "rgb(34 197 94)" } : undefined} // make tick green when done
                  >
                    {ex.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M4 12l4 4 8-8" />
                      </svg>
                    ) : (
                      <span className="sr-only">unchecked</span>
                    )}
                  </button>

                  <div className="flex flex-col leading-tight">
                    <span className={`text-[14px] ${ex.done ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {ex.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {typeof ex.estimatedMins === "number" && (
                        <span className="text-[11px] text-gray-600">{ex.estimatedMins} min</span>
                      )}
                      {ex.difficulty && (
                        <span className={`px-1.5 py-0.5 rounded ${difficultyStyles(ex.difficulty).badge} text-[10px] uppercase tracking-wide`}>
                          {ex.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Open link */}
                <button
                  onClick={() => onOpen(ex.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2 py-1 text-[12px] hover:bg-gray-50"
                  aria-label={`Open ${ex.title}`}
                >
                  <span className="hidden sm:inline">Open</span>
                  <ArrowRight small />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Leaderboard (sorted by percent desc) */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-1">Leaderboard (Accuracy)</h3>
          <p className="text-xs text-gray-600 mb-3">Top 5 + you (accuracy only)</p>

          {(() => {
            const rows = Array.isArray(leaderboard) ? leaderboard : [];
            const sorted = [...rows].sort((a, b) => (b.percent - a.percent) || (a.rank - b.rank) || a.name.localeCompare(b.name));
            const top = sorted.slice(0, 5);
            const meIdx = getUserLeaderboardIndex(sorted, patientName);
            const meInTop = meIdx >= 0 && meIdx < 5;
            const meRow = meIdx >= 0 ? sorted[meIdx] : undefined;

            const RowCard = ({ row, isMe }: { row: LeaderboardRow; isMe: boolean }) => (
              <div
                className={
                  "rounded-md border px-3 py-2.5 text-sm flex items-center justify-between " +
                  (isMe ? "border-green-500 bg-green-50 ring-1 ring-green-400" : "border-gray-300 bg-white")
                }
                aria-current={isMe ? "true" : undefined}
              >
                <span className={"font-medium truncate max-w-[60%] " + (isMe ? "text-green-800" : "")}>#{row.rank} {row.name}</span>
                <span className={isMe ? "text-green-800" : "text-gray-700"}>{row.percent}%</span>
              </div>
            );

            return (
              <div className="space-y-3">
                {top[0] && <RowCard row={top[0]} isMe={isLeaderboardMe(top[0], patientName)} />}
                <div className="grid grid-cols-2 gap-3">
                  {top[1] && <RowCard row={top[1]} isMe={isLeaderboardMe(top[1], patientName)} />}
                  {top[2] && <RowCard row={top[2]} isMe={isLeaderboardMe(top[2], patientName)} />}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {top[3] && <RowCard row={top[3]} isMe={isLeaderboardMe(top[3], patientName)} />}
                  {top[4] && <RowCard row={top[4]} isMe={isLeaderboardMe(top[4], patientName)} />}
                </div>
                {!meInTop && meRow && (
                  <>
                    <div className="my-1 h-px bg-gray-300/70" />
                    <RowCard row={meRow} isMe={true} />
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Right: Progress + Calendar ------------------ */
function ProgressCircleCard({
  progress,
  monthMatrix,
  monthLabel,
  today,
  apptDays,
  planDays,
  plans,
  selectedDate,
  onSelectDate,
  selectedPlans,
}: {
  progress: number; // OVERALL progress 0..1
  monthMatrix: (Date | null)[][];
  monthLabel: string;
  today: Date;
  apptDays: Set<string>;
  planDays: Set<string>;
  plans: Plan[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedPlans: Plan[];
}): JSX.Element {
  const size = 560;
  const stroke = 12; // thin outer ring
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c;
  const offset = dash - dash * progress;

  const selectedISO = formatYMD(selectedDate);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90 select-none">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(236, 236, 236, 1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#86efac"
          strokeWidth={stroke}
          strokeDasharray={dash}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>

      <div className="absolute inset-6 rounded-full bg-gray-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold">{monthLabel}</h4>
            <span suppressHydrationWarning className="text-sm text-gray-600">{formatYMD(today)}</span>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-1 text-[11px]">
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d) => (
              <div key={d} className="text-gray-500 py-1 text-center">{d}</div>
            ))}
            {monthMatrix.flat().map((d, i) => {
              const isToday = Boolean(d && sameDay(d, today));
              const iso = d ? formatYMD(d) : "";
              const hasAppt = Boolean(d && apptDays?.has && apptDays.has(iso));
              const hasPlan = Boolean(d && planDays?.has && planDays.has(iso));
              const isSelected = Boolean(d && iso === selectedISO);
              const base = d ? (isSelected ? "bg-gray-900 text-white" : isToday ? "bg-gray-800/10" : "bg-white") : "bg-transparent";
              return (
                <button
                  type="button"
                  key={i}
                  disabled={!d}
                  onClick={() => d && onSelectDate(d)}
                  className={
                    "aspect-square rounded relative flex items-center justify-center outline-none transition " +
                    base +
                    (d ? " hover:ring-2 hover:ring-gray-400 focus:ring-2 focus:ring-gray-600" : " cursor-default")
                  }
                  aria-pressed={isSelected}
                  aria-label={d ? `Select ${iso}` : "empty"}
                >
                  {d ? d.getDate() : ""}
                  {d && (hasAppt || hasPlan) && (
                    <div className="absolute bottom-1 flex items-center gap-1">
                      {hasAppt && <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      {hasPlan && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Planning list */}
          <div className="mt-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">Planning</h5>
              <div className="text-xs text-gray-600">{selectedISO}</div>
            </div>
            <ul className="space-y-1 text-sm min-h-[72px]">
              {selectedPlans.length === 0 && (
                <li className="rounded-md border bg-white px-3 py-2 text-gray-500">No plans for this day</li>
              )}
              {selectedPlans.map((p) => (
                <li key={(p.id ?? `${p.date}-${p.title}`) as string} className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                  <span>{p.title || "Planned exercise"}</span>
                  <span className="text-gray-500">{p.when || formatYMD(new Date(p.date))}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />Appointment</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" />Plan</span>
              <span className="ml-auto">Ring = overall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Utilities ---------------------------- */
function isLeaderboardMe(row: LeaderboardRow, patientName: string): boolean {
  // boolean-safe
  return row?.name === "Me" || (patientName ? row?.name === patientName : false);
}
function getUserLeaderboardIndex(rows: LeaderboardRow[], patientName: string): number {
  if (!Array.isArray(rows)) return -1;
  const byMe = rows.findIndex((r) => r && r.name === "Me");
  if (byMe >= 0) return byMe;
  return rows.findIndex((r) => r && (patientName ? r.name === patientName : false));
}

function ArrowRight({ small }: { small?: boolean }): JSX.Element {
  const w = small ? 16 : 20;
  const h = small ? 16 : 20;
  const sw = small ? 2 : 2;
  return (
    <svg width={w} height={h} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} className="text-gray-900">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildMonthMatrix(anchor: Date): { monthMatrix: (Date | null)[][]; monthLabel: string } {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const matrix: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) matrix.push(cells.slice(i, i + 7));
  const label = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" }).format(first);
  return { monthMatrix: matrix, monthLabel: label };
}
function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function getNextAppointment(appts: Appointment[]): Appointment | null {
  const list = Array.isArray(appts) ? appts : [];
  const now = Date.now();
  const future = list
    .filter(Boolean)
    .map((a) => ({ ...a, ts: new Date(a.start).getTime() }))
    .filter((a) => !Number.isNaN(a.ts) && a.ts > now)
    .sort((a, b) => a.ts - b.ts);
  return (future[0] as Appointment) || null;
}
