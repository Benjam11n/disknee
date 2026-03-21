import { z } from "zod";

const ExerciseSessionBaseSchema = z.object({
  accuracy: z.number().min(0).max(100).default(0),
  duration: z.number().int().min(0).optional(),
  endedAt: z.date().optional(),
  maxAccuracy: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
  repsCompleted: z.number().int().min(0).default(0),
  startedAt: z.date(),
  videoUrl: z.string().url().optional(),
});

export const CreateExerciseSessionSchema = ExerciseSessionBaseSchema.extend({
  endedAt: z.string().datetime("Invalid end date format").optional(),
  exerciseId: z.string(),
  startedAt: z.string().datetime("Invalid start date format"),
});

export const CreateReflectionSchema = z.object({
  exerciseSessionId: z.string(),
  fatigue: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
  rating: z.number().int().min(1).max(5),
});

export const GetExerciseSessionsSchema = z.object({
  endDate: z.string().datetime("Invalid end date format").optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().datetime("Invalid start date format").optional(),
});

export const GetExerciseSessionByIdSchema = z.object({
  id: z.string(),
});
