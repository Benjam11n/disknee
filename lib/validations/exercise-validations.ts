import { ExerciseDifficulty } from "@prisma/client";
import { z } from "zod";

const ExerciseBaseSchema = z.object({
  difficulty: z.nativeEnum(ExerciseDifficulty),
  done: z.boolean().default(false),
  estimatedMins: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(180, "Duration cannot exceed 3 hours"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  videoUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

export const CreateExerciseSchema = ExerciseBaseSchema.extend({
  planId: z.string(),
});

// Query parameters schema
export const GetExercisesSchema = z.object({
  difficulty: z.nativeEnum(ExerciseDifficulty).optional(),
  done: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
  planId: z.string().optional(),
});

// Get exercise by ID schema
export const GetExerciseByIdSchema = z.object({
  id: z.string(),
});

// Update exercise status schema
export const UpdateExerciseDoneSchema = z.object({
  done: z.boolean(),
  id: z.string(),
});
