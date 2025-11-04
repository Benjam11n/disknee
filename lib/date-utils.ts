// Date utility functions for the DisKnee application

import { Appointment } from "@prisma/client";

/**
 * Check if two dates represent the same day
 */
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Format a date as YYYY-MM-DD string
 */
export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build a calendar matrix for a given month
 */
export function buildMonthMatrix(anchor: Date): {
  monthMatrix: (Date | null)[][];
  monthLabel: string;
} {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) cells.push(null);
  // Add all days of the month
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  // Fill remaining cells to complete the last week
  while (cells.length % 7 !== 0) cells.push(null);

  // Convert flat array to 2D matrix (weeks)
  const matrix: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) matrix.push(cells.slice(i, i + 7));

  // Format month label
  const label = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(first);

  return { monthMatrix: matrix, monthLabel: label };
}

/**
 * Format a date string with time
 */
export function formatDateTime(
  dateStr: string,
  options: {
    includeTime?: boolean;
    locale?: string;
    timeFormat?: "12" | "24";
  } = {}
): string {
  const { includeTime = true, locale = "en-AU", timeFormat = "24" } = options;

  const date = new Date(dateStr);

  if (includeTime) {
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: timeFormat === "12",
    };
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } else {
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }
}

/**
 * Format time from HH:MM string to 12-hour format
 */
export function formatTime(
  timeStr: string,
  options: {
    format?: "12" | "24";
    locale?: string;
  } = {}
): string {
  const { format = "12" } = options;

  if (format === "24") {
    return timeStr;
  }

  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
}
