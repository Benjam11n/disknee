import pino from "pino";

import { env } from "@/env";

const isEdge = process.env.NEXT_RUNTIME === "edge";
const isProduction = env.NEXT_PUBLIC_VERCEL_ENV === "production";

/**
 * Configured Pino logger instance with environment-specific settings.
 * Uses pretty formatting in development and JSON in production.
 */
export const logger = pino({
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  level: env.NEXT_PUBLIC_LOG_LEVEL ?? "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    !isEdge && !isProduction
      ? {
          options: {
            colorize: true,
          },
          target: "pino-pretty",
        }
      : undefined,
});
