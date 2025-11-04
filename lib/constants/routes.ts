// Centralized route constants for the DisKnee application
// This ensures type safety and maintainability across the entire codebase

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  // todo: rename to /call
  CALLS: "/calls",
  CALL: {
    detail: (exerciseId: string) => `/calls/${exerciseId}`,
  },
  EXERCISE: {
    BASE: "/exercise",
    detail: (id: string) => `/exercise/${id}`,
  },
  LEADERBOARD: "/leaderboard",
  SHOP: "/shop",

  // not implemented yet
  SETTINGS: "/settings",
  HELP: "/help",
} as const;
