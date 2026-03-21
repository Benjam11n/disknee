import { z } from "zod";

export const GetPlansSchema = z.object({
  endDate: z.string().datetime("Invalid end date format").optional(),
  include: z
    .object({
      exercises: z.boolean().default(false),
    })
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().datetime("Invalid start date format").optional(),
});

export const GetPlanByIdSchema = z.object({
  id: z.string(),
});
