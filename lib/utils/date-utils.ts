// Date utility functions for the DisKnee application

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
 * Get the start of the week (Monday) for a given date
 * @param d - The date to get the week start for
 * @returns The start of the week (Monday) at 00:00:00
 */
export const startOfWeekMonday = (d: Date) => {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7; // Adjust so Monday is 0
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

/**
 * Add days to a date
 * @param d - The base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export const addDays = (d: Date, days: number) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
};

/**
 * Get start of day (00:00:00)
 * @param d - The date
 * @returns New date at start of day
 */
export const startOfDay = (d: Date = new Date()) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

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
  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }
  // Add all days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  // Fill remaining cells to complete the last week
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  // Convert flat array to 2D matrix (weeks)
  const matrix: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    matrix.push(cells.slice(i, i + 7));
  }

  // Format month label
  const label = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(first);

  return { monthLabel: label, monthMatrix: matrix };
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
      day: "numeric",
      hour: "numeric",
      hour12: timeFormat === "12",
      minute: "2-digit",
      month: "short",
      weekday: "short",
    };
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    weekday: "short",
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

/**
 * Format time from HH:MM string to 12-hour format
 */
function formatTime12Hour(
  timeStr: string,
  _options: {
    locale?: string;
  } = {}
): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format time from HH:MM string to 24-hour format
 */
export function formatTime24Hour(
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

  return formatTime12Hour(timeStr, { locale: options.locale });
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format date in short format (e.g., "5 Jan 2024")
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format day header (e.g., "Monday, 1 January 2024")
 */
export function formatDayHeader(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
}

/**
 * Format timestamp with date and time
 */
export function formatTimestamp(dateStr?: string | null): string {
  if (!dateStr) {
    return "-";
  }
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Legacy exports for backward compatibility
export const formatTime = {
  "24hour": formatTime24Hour,
  duration: formatDuration,
};
