import type { Prisma } from "@prisma/client";
import type z from "zod";

import type {
  GetPlanByIdSchema,
  GetPlansSchema,
} from "@/lib/validations/plan-validations";

export type GetPlansParams = z.infer<typeof GetPlansSchema>;
export type GetPlanByIdParams = z.infer<typeof GetPlanByIdSchema>;
export type PlanWithExercises = Prisma.PlanGetPayload<{
  include: { exercises: true };
}>;
