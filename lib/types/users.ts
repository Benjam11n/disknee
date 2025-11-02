import z from "zod";

import { GetUserByIdSchema } from "@/lib/validations/users-schemas";

export type GetUserByIdParams = z.infer<typeof GetUserByIdSchema>;
