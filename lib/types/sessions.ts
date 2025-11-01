import z from "zod";
import {
  CreateReflectionSchema,
  CreateSessionSchema,
  GetSessionByIdSchema,
  GetSessionsSchema,
} from "../validations/session-schemas";

// Types
export type CreateSessionParams = z.infer<typeof CreateSessionSchema>;
export type CreateReflectionParams = z.infer<typeof CreateReflectionSchema>;
export type GetSessionsParams = z.infer<typeof GetSessionsSchema>;
export type GetSessionByIdParams = z.infer<typeof GetSessionByIdSchema>;
