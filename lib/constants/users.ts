// TODO: User constants for demo and development purposes
// In production, these should come from authentication context

export const DEMO_USERS = {
  // Primary demo user (Donald Duck)
  PRIMARY_ID: "cmhhhn7ne00043f6bnva8up6p",
  PRIMARY_NAME: "Donald Duck",

  // Fallback user for development
  FALLBACK_ID: "default-user-id",
  FALLBACK_NAME: "Demo User",
} as const;

// Get the current user ID from environment or fallback
export function getCurrentUserId(): string {
  // In a real app, this would come from authentication context
  // For now, we use the environment variable or fallback
  return process.env.NEXT_PUBLIC_DEMO_USER_ID || DEMO_USERS.PRIMARY_ID;
}

// Get the current user name
export function getCurrentUserName(): string {
  return process.env.NEXT_PUBLIC_DEMO_USER_NAME || DEMO_USERS.PRIMARY_NAME;
}

// Demo credentials for login page
export const DEMO_CREDENTIALS = [
  {
    email: "demo@disknee.com",
    password: "demo123",
    name: "Demo User",
    id: DEMO_USERS.PRIMARY_ID,
  },
  {
    email: "patient@example.com",
    password: "patient2024",
    name: "John Patient",
    id: "patient-user-id",
  },
  {
    email: "physio@example.com",
    password: "physio2024",
    name: "Dr. Smith",
    id: "physio-user-id",
  },
] as const;
