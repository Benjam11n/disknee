import type z from "zod";

import type {
  GetLeaderboardByRankSchema,
  GetLeaderboardSchema,
} from "@/lib/validations/leaderboard-validations";

export type GetLeaderboardParams = z.infer<typeof GetLeaderboardSchema>;
export type GetLeaderboardByRankParams = z.infer<
  typeof GetLeaderboardByRankSchema
>;
