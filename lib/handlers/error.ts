import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { RequestError, ValidationError } from '@/lib/http-errors';
import { logger } from '@/lib/logger';

type ResponseType = 'api' | 'server';

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === 'api'
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

export const handleError = (error: unknown, responseType: ResponseType = 'server') => {
  if (error instanceof RequestError) {
    logger.error(
      {
        type: 'RequestError',
        statusCode: error.statusCode,
        errors: error.errors,
        stack: error.stack,
      },
      `${responseType.toUpperCase()} Error: ${error.message}`
    );

    return formatResponse(responseType, error.statusCode, error.message, error.errors);
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>
    );

    logger.error(
      {
        type: 'ValidationError',
        fieldErrors: validationError.errors,
        issues: error.issues,
      },
      `Validation Error: ${validationError.message}`
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors
    );
  }

  if (error instanceof Error) {
    logger.error(
      {
        type: 'Error',
        stack: error.stack,
      },
      error.message
    );

    return formatResponse(responseType, 500, error.message);
  }

  logger.error(
    {
      type: 'UnknownError',
      error: String(error),
    },
    'An unexpected error occurred'
  );

  return formatResponse(responseType, 500, 'An unexpected error occurred');
};
