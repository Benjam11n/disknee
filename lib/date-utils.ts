// Date utility functions for the DisKnee application

export interface Appointment {
  id?: string | number;
  start: string;
  doctorName?: string;
  doctorSpecialty?: string;
  locationName?: string;
  locationAddr?: string;
}

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
 * Get the next upcoming appointment from a list of appointments
 */
export function getNextAppointment(appts: Appointment[]): Appointment | null {
  const list = Array.isArray(appts) ? appts : [];
  const now = Date.now();
  const future = list
    .filter(Boolean)
    .map((a) => ({ ...a, ts: new Date(a.start).getTime() }))
    .filter((a) => !Number.isNaN(a.ts) && a.ts > now)
    .sort((a, b) => a.ts - b.ts);
  return (future[0] as Appointment) || null;
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

/**
 * Check if a date is today, tomorrow, or calculate days until
 */
export function getRelativeDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const diffTime = checkDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Get start of day (midnight) for a date
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59.999) for a date
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
