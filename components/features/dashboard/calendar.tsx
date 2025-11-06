"use client";

import { Card } from "@/components/ui/card";
import { CalendarDay } from "./calendar-day";
import { sameDay, formatYMD } from "@/lib/utils/date-utils";

interface CalendarProps {
  monthMatrix: (Date | null)[][];
  monthLabel: string;
  today: Date;
  selectedDate: Date;
  apptDays: Set<string>;
  planDays: Set<string>;
  onSelectDate: (date: Date) => void;
}

export function Calendar({
  monthMatrix,
  monthLabel,
  today,
  selectedDate,
  apptDays,
  planDays,
  onSelectDate,
}: CalendarProps) {
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{monthLabel}</h3>
        <div className="text-xs text-muted-foreground">{formatYMD(today)}</div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {monthMatrix.flat().map((date, index) => {
            const dateStr = date ? formatYMD(date) : "";
            const isToday = date && sameDay(date, today);
            const isSelected = date && sameDay(date, selectedDate);
            const hasAppointment = date && apptDays.has(dateStr);
            const hasPlan = date && planDays.has(dateStr);

            return (
              <CalendarDay
                key={index}
                date={date}
                isToday={isToday ?? false}
                isSelected={isSelected ?? false}
                hasAppointment={hasAppointment ?? false}
                hasPlan={hasPlan ?? false}
                onSelect={onSelectDate}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex items-center justify-around text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary"></div>
          <span>Appointment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-secondary"></div>
          <span>Plan</span>
        </div>
      </div>
    </Card>
  );
}
