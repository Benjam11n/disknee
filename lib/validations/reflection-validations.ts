import * as z from "zod";

export const reflectionSchema = z.object({
  fatigue: z.array(z.number()).min(1).max(5),
  feedback: z.string().optional(),
  rating: z.array(z.number()).min(1).max(5),
});

export type ReflectionFormData = z.infer<typeof reflectionSchema>;
