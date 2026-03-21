import type { Prisma } from "@prisma/client";
import type z from "zod";

import type {
  CreateReflectionSchema,
  CreateExerciseSessionSchema,
  GetExerciseSessionByIdSchema,
  GetExerciseSessionsSchema,
} from "@/lib/validations/exercise-session-validations";

export type CreateExerciseSessionParams = z.infer<
  typeof CreateExerciseSessionSchema
>;
export type CreateReflectionParams = z.infer<typeof CreateReflectionSchema>;
export type GetExerciseSessionsParams = z.infer<
  typeof GetExerciseSessionsSchema
>;
export type GetExerciseSessionByIdParams = z.infer<
  typeof GetExerciseSessionByIdSchema
>;
export type ExerciseSessionWithReflection = Prisma.ExerciseSessionGetPayload<{
  include: { reflection: true };
}>;
