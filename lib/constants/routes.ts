// Centralized route constants for the DisKnee application
// This ensures type safety and maintainability across the entire codebase

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CALLS: "/calls",
  EXERCISE: {
    BASE: "/exercise",
    detail: (id: string) => `/exercise/${id}`,
  },
} as const;
