"use client";

import { Appointment } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface DashboardHeaderProps {
  label: string;
  name: string;
  nextAppt?: Appointment | null;
  primaryDoctorText?: string;
  onSidebarToggle?: () => void;
}

export function DashboardHeader({
  label,
  name,
  nextAppt,
  primaryDoctorText,
  onSidebarToggle,
}: DashboardHeaderProps) {
  const patientName = name || "";

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-7xl">
        {/* Left: sidebar trigger and brand with logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </button>
        </div>

        {/* Right: appointment, theme toggle, and user info grouped */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Next appointment with hover dropdown */}
          <div className="hidden sm:flex items-center gap-2 relative group">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="secondary"
              className="cursor-pointer group-hover:bg-accent transition-colors text-xs"
              suppressHydrationWarning
            >
              <span className="hidden sm:inline">
                {label || "No appointment"}
              </span>
              <span className="sm:hidden">{label?.split(" ")[0] || "—"}</span>
            </Badge>

            {/* Hover card */}
            {nextAppt && (
              <div
                className="absolute top-[110%] left-0 min-w-[280px] rounded-md border bg-popover text-popover-foreground shadow-md p-4 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-20"
                role="tooltip"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-semibold">Next Appointment</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">
                      {nextAppt.doctorName || "Doctor TBD"}
                    </div>
                    {nextAppt.doctorSpecialty && (
                      <div className="text-muted-foreground">
                        {nextAppt.doctorSpecialty}
                      </div>
                    )}
                    {(nextAppt.locationName || nextAppt.locationAddr) && (
                      <div className="mt-2 space-y-1">
                        {nextAppt.locationName && (
                          <div className="flex items-start gap-1">
                            <span className="text-xs">📍</span>
                            <span className="text-xs">
                              {nextAppt.locationName}
                            </span>
                          </div>
                        )}
                        {nextAppt.locationAddr && (
                          <div className="text-xs text-muted-foreground pl-4">
                            {nextAppt.locationAddr}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User avatar and info */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium" title={patientName}>
                {patientName}
              </div>
              {primaryDoctorText && (
                <div
                  className="text-xs text-muted-foreground"
                  title={primaryDoctorText}
                >
                  Dr. {primaryDoctorText}
                </div>
              )}
            </div>

            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              <AvatarImage src="" alt={patientName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {patientName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
