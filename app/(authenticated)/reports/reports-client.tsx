"use client";
import React, { useMemo, useState } from "react";
import { formatShortDate, formatDayHeader, formatTimestamp } from "@/lib/utils/date-utils";

type Item = {
  title: string;
  status: string;
  endedOn: string | null;
  satisfaction: number | null;
  fatigue: number | null;
  comments?: string | null;
  points?: number;
};

type Day = { date: string; items: Item[] };

type Week = {
  weekStart: string;
  days: Day[];
  totalExercises?: number;
  avgSatisfaction?: number | null;
  avgFatigue?: number | null;
  totalPoints?: number;
  reviewed?: "REVIEWED" | "NOT_SENT" | "PENDING" | string | null;
  feedback?: string | null;
};

export default function ReportsClient({ initialWeeks }: { initialWeeks: Week[] }) {
  const [statusFilter, setStatusFilter] = useState<"All" | "REVIEWED" | "NOT_SENT" | "PENDING">("All");
  const [dateFilter, setDateFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return initialWeeks.filter((w) => {
      if (statusFilter !== "All" && (w.reviewed ?? "NOT_SENT") !== statusFilter) return false;
      if (dateFilter && w.weekStart.slice(0, 10) !== dateFilter) return false;
      return true;
    });
  }, [initialWeeks, statusFilter, dateFilter]);

  
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">Filter status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | "REVIEWED" | "NOT_SENT" | "PENDING")}
          className="px-2 py-1 border rounded"
        >
          <option value="All">All</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="PENDING">Pending</option>
          <option value="NOT_SENT">Not Sent</option>
        </select>

        <label className="ml-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Week start (iso)</span>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-2 py-1 border rounded" />
        </label>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <div className="text-sm text-muted-foreground">No weekly reports.</div>}

        {filtered.map((week, wi) => {
          const weekEnd = new Date(week.weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return (
            <details key={wi} className="border-2 rounded-lg p-4" open={wi === 0}>
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <div>
                  <div className="text-lg font-semibold">
                    Week {formatShortDate(week.weekStart)} — {formatShortDate(weekEnd.toISOString())}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4">
                    <span>{week.days.length} day{week.days.length > 1 ? "s" : ""}</span>
                    <span className="opacity-60">•</span>
                    <span>{week.totalExercises ?? week.days.flatMap(d=>d.items).length} exercise{(week.totalExercises ?? week.days.flatMap(d=>d.items).length) > 1 ? "s" : ""}</span>
                    <span className="opacity-60">•</span>
                    <span>Avg Satisfaction: {week.avgSatisfaction ?? "-"}</span>
                    <span className="opacity-60">•</span>
                    <span>Avg Fatigueness: {week.avgFatigue ?? "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {week.reviewed === "REVIEWED" ? <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">Reviewed</span>
                     : week.reviewed === "PENDING" ? <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-900 text-xs">Pending</span>
                     : <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">Not Sent</span>}
                  </div>
                </div>
              </summary>

              <div className="mt-4 space-y-4">
                {week.days.map((day, di) => (
                  <div key={di} className="border rounded-md p-3 bg-card">
                    <div className="font-medium mb-2">{formatDayHeader(day.date)}</div>
                    <div className="space-y-3">
                      {day.items.map((it, ii) => (
                        <div key={ii}>
                          <div className="font-semibold">{it.title}</div>
                          <div className="text-sm text-muted-foreground">
                            <div><strong>Status:</strong> {it.status}</div>
                            <div><strong>Ended on:</strong> {formatTimestamp(it.endedOn)}</div>
                            <div><strong>Satisfaction:</strong> {it.satisfaction ?? "-"}/10</div>
                            <div><strong>Fatigue:</strong> {it.fatigue ?? "-"}/10</div>
                            <div><strong>Comments:</strong> {it.comments ?? "-"}</div>
                          </div>
                          <hr className="my-2 border-t border-muted-foreground/30" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {week.feedback && (
                  <div className="mt-2 p-3 border rounded-md bg-neutral/5">
                    <div className="text-sm font-bold uppercase !tracking-[3px]">Feedback</div>
                    <div className="mt-1 text-sm">{week.feedback}</div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}