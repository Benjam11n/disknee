import z from "zod";
import {
  CreateExerciseSchema,
  GetExerciseByIdSchema,
  GetExercisesSchema,
  UpdateExerciseDoneSchema,
} from "@/lib/validations/exercise-validations";

export type GetExercisesParams = z.infer<typeof GetExercisesSchema>;
export type GetExerciseByIdParams = z.infer<typeof GetExerciseByIdSchema>;
export type CreateExerciseParams = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseDoneParams = z.infer<typeof UpdateExerciseDoneSchema>;
