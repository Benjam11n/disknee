import z from "zod";
import {
  CreateExerciseSchema,
  GetExerciseByIdSchema,
  GetExercisesSchema,
} from "../validations/exercise-schemas";

export type GetExercisesParams = z.infer<typeof GetExercisesSchema>;
export type GetExerciseByIdParams = z.infer<typeof GetExerciseByIdSchema>;
export type CreateExerciseParams = z.infer<typeof CreateExerciseSchema>;
