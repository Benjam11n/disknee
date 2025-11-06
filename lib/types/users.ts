import z from 'zod';

import { GetUserByIdSchema } from '@/lib/validations/users-validations';

export type GetUserByIdParams = z.infer<typeof GetUserByIdSchema>;
