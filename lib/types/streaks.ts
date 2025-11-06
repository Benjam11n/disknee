import { UserStreak } from '@prisma/client';
import { GetStreakSchema } from '../validations/streaks-validations';
import z from 'zod';

export type StreakData = UserStreak & {
  hasCheckedInToday: boolean;
};

export type GetStreakParams = z.infer<typeof GetStreakSchema>;
