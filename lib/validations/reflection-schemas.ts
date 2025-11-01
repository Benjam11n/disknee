import * as z from "zod";

export const reflectionSchema = z.object({
  rating: z.array(z.number()).min(1).max(5),
  fatigue: z.array(z.number()).min(1).max(5),
  feedback: z.string().optional(),
});

export type ReflectionFormData = z.infer<typeof reflectionSchema>;
