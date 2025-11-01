import z from "zod";
import { GetPlansSchema } from "@/lib/validations/plan-schemas";

export type GetPlansParams = z.infer<typeof GetPlansSchema>;
