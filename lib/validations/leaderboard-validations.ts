import { z } from "zod";

export const GetLeaderboardSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  name: z.string().optional(),
  offset: z.coerce.number().min(0).default(0),
  rankingType: z.enum(["score", "accuracy"]).default("score"),
  sortBy: z
    .enum(["rank", "weeks", "accuracyPercentage", "score"])
    .default("rank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Get leaderboard by rank range
export const GetLeaderboardByRankSchema = z.object({
  endRank: z.coerce
    .number()
    .min(1, "End rank must be a positive integer")
    .optional(),
  rankingType: z.enum(["score", "accuracy"]).default("score"),
  startRank: z.coerce
    .number()
    .min(1, "Start rank must be a positive integer")
    .default(1),
});
