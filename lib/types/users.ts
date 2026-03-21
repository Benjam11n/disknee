import type z from "zod";

import type { GetUserByIdSchema } from "@/lib/validations/users-validations";

export type GetUserByIdParams = z.infer<typeof GetUserByIdSchema>;
