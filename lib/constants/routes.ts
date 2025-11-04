// Centralized route constants for the DisKnee application
// This ensures type safety and maintainability across the entire codebase

// todo: update DASHBOARD ROUTE
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
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
} as const;
