import z from "zod";
import { GetExercisesSchema } from "../validations/exercise-schemas";

export type GetExercisesParams = z.infer<typeof GetExercisesSchema>;
