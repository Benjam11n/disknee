import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format rank display (e.g., 1500 -> 1.5k)
 */
export function getRankDisplay(rank: number): string {
  if (rank >= 1000) {
    return `${(rank / 1000).toFixed(1)}k`;
  }
  return rank.toString();
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get difficulty color classes based on difficulty level
 */
export function getDifficultyStyles(difficulty?: "easy" | "moderate" | "hard") {
  switch (difficulty) {
    case "easy":
      return {
        row: "bg-emerald-50 border-emerald-200",
        box: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      };
    case "moderate":
      return {
        row: "bg-amber-50 border-amber-200",
        box: "border-amber-500",
        badge: "bg-amber-100 text-amber-800 border border-amber-300",
      };
    case "hard":
      return {
        row: "bg-rose-50 border-rose-200",
        box: "border-rose-500",
        badge: "bg-rose-100 text-rose-800 border border-rose-300",
      };
    default:
      return {
        row: "bg-white border-gray-300",
        box: "border-gray-800",
        badge: "bg-gray-100 text-gray-700 border border-gray-300",
      };
  }
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
