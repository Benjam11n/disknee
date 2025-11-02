import { z } from "zod";

const SessionBaseSchema = z.object({
  startedAt: z.date(),
  endedAt: z.date().optional(),
  duration: z.number().int().min(0).optional(),
  repsCompleted: z.number().int().min(0).default(0),
  accuracy: z.number().min(0).max(100).default(0),
  maxAccuracy: z.number().min(0).max(100).optional(),
  videoUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const CreateSessionSchema = SessionBaseSchema.extend({
  startedAt: z.string().datetime("Invalid start date format"),
  endedAt: z.string().datetime("Invalid end date format").optional(),
  exerciseId: z.string().optional(),
});

export const CreateReflectionSchema = z.object({
  sessionId: z.string(),
  rating: z.number().int().min(1).max(5),
  fatigue: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

export const GetSessionsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
});

export const GetSessionByIdSchema = z.object({
  id: z.string(),
});
