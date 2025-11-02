import z from "zod";

import { GetUserByIdSchema } from "../validations/users-schemas";

export type GetUserByIdParams = z.infer<typeof GetUserByIdSchema>;
