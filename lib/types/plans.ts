import z from "zod";
import {
  GetPlanByIdSchema,
  GetPlansByDateRangeSchema,
  GetPlansSchema,
} from "@/lib/validations/plan-validations";
import { Prisma } from "@prisma/client";

export type GetPlansParams = z.infer<typeof GetPlansSchema>;
export type GetPlansByDateRangeParams = z.infer<
  typeof GetPlansByDateRangeSchema
>;
export type GetPlanByIdParams = z.infer<typeof GetPlanByIdSchema>;
export type PlanWithExercises = Prisma.PlanGetPayload<{
  include: { exercises: true };
}>;
