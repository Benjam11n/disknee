import z from "zod";
import {
  GetPlanByIdSchema,
  GetPlansSchema,
} from "@/lib/validations/plan-validations";
import { Prisma } from "@prisma/client";

export type GetPlansParams = z.infer<typeof GetPlansSchema>;
export type GetPlanByIdParams = z.infer<typeof GetPlanByIdSchema>;
export type PlanWithExercises = Prisma.PlanGetPayload<{
  include: { exercises: true };
}>;
