import z from "zod";
import { GetLeaderboardSchema } from "@/lib/validations/leaderboard-schemas";

export type GetLeaderboardParams = z.infer<typeof GetLeaderboardSchema>;
