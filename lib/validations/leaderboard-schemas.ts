import { z } from "zod";

export const GetLeaderboardSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(["rank", "weeks", "percent"]).default("rank"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  name: z.string().optional(),
});
