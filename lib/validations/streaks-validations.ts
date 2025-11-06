import z from 'zod';

export const GetStreakSchema = z.object({
  userId: z.string().uuid(),
});
