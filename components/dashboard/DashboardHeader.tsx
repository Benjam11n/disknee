"use client";

import { Appointment } from "@prisma/client";
import { Activity } from "lucide-react";

interface DashboardHeaderProps {
  label: string;
  name: string;
  nextAppt?: Appointment | null;
  primaryDoctorText?: string;
}

export function DashboardHeader({
  label,
  name,
  nextAppt,
  primaryDoctorText,
}: DashboardHeaderProps) {
  const patientName = name || "";

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto grid grid-cols-3 items-center gap-6 px-6 py-3 max-w-[1200px]">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">DisKnee</h1>
        </div>

        {/* Middle: next appointment with hover dropdown */}
        <div className="hidden md:flex items-center justify-center gap-3 text-sm relative group">
          <span className="text-muted-foreground">Next appointment</span>

          {/* Badge that triggers the dropdown */}
          <span
            suppressHydrationWarning
            className="inline-flex items-center rounded-full border border-input bg-background px-3 py-1 font-medium cursor-default group-hover:border-accent transition-colors"
          >
            {label || "—"}
          </span>

          {/* Hover card */}
          {nextAppt && (
            <div
              className="absolute top-[110%] left-1/2 -translate-x-1/2 min-w-[260px] rounded-md border bg-popover text-popover-foreground shadow-md p-3 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all"
              role="tooltip"
            >
              <div className="text-[13px] leading-5">
                <div className="font-semibold">
                  {nextAppt.doctorName || "Doctor TBD"}
                </div>
                {nextAppt.doctorSpecialty && (
                  <div className="text-muted-foreground">
                    {nextAppt.doctorSpecialty}
                  </div>
                )}
                {(nextAppt.locationName || nextAppt.locationAddr) && (
                  <div className="mt-2">
                    <div className="text-foreground">
                      {nextAppt.locationName}
                    </div>
                    <div className="text-muted-foreground">
                      {nextAppt.locationAddr}
                    </div>
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
              className="hidden sm:inline-flex max-w-[300px] truncate rounded-full border bg-accent text-accent-foreground px-3 py-1 text-xs"
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
