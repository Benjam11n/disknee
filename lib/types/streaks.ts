import type { UserStreak } from "@prisma/client";
import type z from "zod";

import type { GetStreakSchema } from "../validations/streaks-validations";

export type StreakData = UserStreak & {
  hasCheckedInToday: boolean;
};

export type GetStreakParams = z.infer<typeof GetStreakSchema>;
