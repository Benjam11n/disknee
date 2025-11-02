import z from "zod";
import {
  CreateReflectionSchema,
  CreateSessionSchema,
  GetSessionByIdSchema,
  GetSessionsSchema,
} from "@/lib/validations/session-validations";

export type CreateSessionParams = z.infer<typeof CreateSessionSchema>;
export type CreateReflectionParams = z.infer<typeof CreateReflectionSchema>;
export type GetSessionsParams = z.infer<typeof GetSessionsSchema>;
export type GetSessionByIdParams = z.infer<typeof GetSessionByIdSchema>;
