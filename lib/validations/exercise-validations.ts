import { Difficulty } from "@prisma/client";
import { z } from "zod";

const ExerciseBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  estimatedMins: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(180, "Duration cannot exceed 3 hours"),
  difficulty: z.nativeEnum(Difficulty),
  done: z.boolean().default(false),
});

export const CreateExerciseSchema = ExerciseBaseSchema.extend({
  planId: z.string(),
});

// Query parameters schema
export const GetExercisesSchema = z.object({
  difficulty: z.nativeEnum(Difficulty).optional(),
  done: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Get exercise by ID schema
export const GetExerciseByIdSchema = z.object({
  id: z.string(),
});

// Update exercise status schema
export const UpdateExerciseDoneSchema = z.object({
  id: z.string(),
  done: z.boolean(),
});
