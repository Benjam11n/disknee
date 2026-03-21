import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RequestError, ValidationError } from "@/lib/http-errors";
import { logger } from "@/lib/logger";

type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    error: {
      details: errors,
      message,
    },
    success: false,
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

export const handleError = (
  error: unknown,
  responseType: ResponseType = "server"
) => {
  if (error instanceof RequestError) {
    logger.error(
      {
        errors: error.errors,
        stack: error.stack,
        statusCode: error.statusCode,
        type: "RequestError",
      },
      `${responseType.toUpperCase()} Error: ${error.message}`
    );

    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>
    );

    logger.error(
      {
        fieldErrors: validationError.errors,
        issues: error.issues,
        type: "ValidationError",
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
        stack: error.stack,
        type: "Error",
      },
      error.message
    );

    return formatResponse(responseType, 500, error.message);
  }

  logger.error(
    {
      error: String(error),
      type: "UnknownError",
    },
    "An unexpected error occurred"
  );

  return formatResponse(responseType, 500, "An unexpected error occurred");
};
