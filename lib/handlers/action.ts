'use server';

import { ZodError, ZodSchema } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/http-errors';

import { ValidationError } from '@/lib/http-errors';
import { logger } from '../logger';

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

// 1. Checking whether the schema and params are provided and validated.
// 2. Checking whether the user is authorized.
// 3. Connecting to the database.
// 4. Returning the params and session.

export async function action<T>({ params, schema, authorize = true }: ActionOptions<T>) {
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(error.flatten().fieldErrors as Record<string, string[]>);
      } else {
        return new Error('Schema validation failed');
      }
    }
  }

  let session = null;
  if (authorize) {
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return new UnauthorizedError('Authentication required');
      }
    } catch (error) {
      logger.error(error, 'Failed to authenticate');
      return new UnauthorizedError('Failed to authenticate');
    }
  }

  return { params, session };
}
