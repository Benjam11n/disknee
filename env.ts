import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are NOT exposed to the client
   */
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_DIRECT_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
  },

  /**
   * Client-side environment variables
   * These are safely exposed to the browser
   * Note: Use the full variable names as they appear in .env
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .optional(),
    NEXT_PUBLIC_LOG_LEVEL: z
      .enum(["error", "warn", "info", "debug", "trace"])
      .default("info"),
  },

  /**
   * Runtime environment variables
   * Explicitly pass the environment variables
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  },
  emptyStringAsUndefined: true,
});

/**
 * Helper to check if we're on the server
 */
export const isServer = typeof window === "undefined";

/**
 * Helper to get environment info
 * Safely handles server-only variables
 */
export const envInfo = {
  get isDevelopment() {
    return env.NODE_ENV === "development";
  },
  get isProduction() {
    return env.NODE_ENV === "production";
  },
  get isTest() {
    return env.NODE_ENV === "test";
  },
  get isEdge() {
    return isServer ? env.NEXT_RUNTIME === "edge" : false;
  },
  get vercelEnv() {
    return env.NEXT_PUBLIC_VERCEL_ENV;
  },
};
