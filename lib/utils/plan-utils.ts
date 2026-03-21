import { sameDay } from "@/lib/utils/date-utils";

/**
 * Formats a date string into a human-readable format
 * - Shows "Today" or "Tomorrow" for those days
 * - Otherwise shows formatted date like "Mon, Jan 1"
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (sameDay(date, today)) {
    return "Today";
  }
  if (sameDay(date, tomorrow)) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

/**
 * Returns a human-readable description of days until/from the given date
 * - "Today" for current day
 * - "Tomorrow" for next day
 * - "In X days" for future dates
 * - "X days ago" for past dates
 */
export function getDaysUntil(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  if (diffDays > 0) {
    return `In ${diffDays} days`;
  }
  return `${Math.abs(diffDays)} days ago`;
}
