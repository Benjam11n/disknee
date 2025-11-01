import { z } from "zod";

const PlanBaseSchema = z.object({
  date: z.date(),
  title: z
    .string()
    .min(1, "Plan title is required")
    .max(200, "Plan title too long"),
  when: z.string(), // Display time like "Sat 6:00 pm"
});

// Create plan schema
export const CreatePlanSchema = PlanBaseSchema.extend({
  date: z.string().datetime("Invalid date format"),
});

// Query parameters schema
export const GetPlansSchema = z.object({
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});
