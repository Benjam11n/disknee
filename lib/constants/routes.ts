// Centralized route constants for the DisKnee application
// This ensures type safety and maintainability across the entire codebase

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  CALL: '/call',
  CALL_DETAIL: (exerciseId: string) => `/call/${exerciseId}`,
  EXERCISE: {
    BASE: '/exercise',
    detail: (id: string) => `/exercise/${id}`,
  },
  EXERCISES_ALL: '/exercise/all',
  REPORTS: '/reports',
  LEADERBOARD: '/leaderboard',
  SHOP: '/shop',
  TRY_ON: '/try-on',

  // not implemented yet
  SETTINGS: '/settings',
  HELP: '/help',
} as const;
