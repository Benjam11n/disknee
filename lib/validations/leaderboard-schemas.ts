import { z } from "zod";

export const GetLeaderboardSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(["rank", "weeks", "percent"]).default("rank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  name: z.string().optional(),
});

// Get leaderboard by rank range
export const GetLeaderboardByRankSchema = z.object({
  startRank: z.coerce
    .number()
    .min(1, "Start rank must be a positive integer")
    .default(1),
  endRank: z.coerce
    .number()
    .min(1, "End rank must be a positive integer")
    .optional(),
});
