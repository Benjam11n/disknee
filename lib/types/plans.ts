import z from "zod";
import {
  GetPlanByIdSchema,
  GetPlansByDateRangeSchema,
  GetPlansSchema,
} from "@/lib/validations/plan-schemas";

export type GetPlansParams = z.infer<typeof GetPlansSchema>;
export type GetPlansByDateRangeParams = z.infer<
  typeof GetPlansByDateRangeSchema
>;
export type GetPlanByIdParams = z.infer<typeof GetPlanByIdSchema>;
