"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  CreateSessionSchema,
  CreateReflectionSchema,
  GetSessionsSchema,
  GetSessionByIdSchema,
} from "@/lib/validations/session-schemas";
import {
  CreateReflectionParams,
  CreateSessionParams,
  GetSessionByIdParams,
  GetSessionsParams,
} from "../types/sessions";

export async function createSession(params: CreateSessionParams) {
  const validationResult = await action({
    params: params,
    schema: CreateSessionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    startedAt,
    endedAt,
    duration,
    repsCompleted,
    accuracy,
    maxAccuracy,
    videoUrl,
    notes,
  } = validationResult.params!;

  try {
    const session = await prisma.session.create({
      data: {
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : undefined,
        duration,
        repsCompleted,
        accuracy,
        maxAccuracy,
        videoUrl,
        notes,
      },
    });

    return session;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSessions(params: GetSessionsParams) {
  const validationResult = await action({
    params: params,
    schema: GetSessionsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, startDate, endDate } = validationResult.params!;

  try {
    const sessions = await prisma.session.findMany({
      where: {
        startedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        reflection: true,
      },
    });

    return sessions;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSessionById(params: GetSessionByIdParams) {
  const validationResult = await action({
    params: params,
    schema: GetSessionByIdSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        reflection: true,
      },
    });

    if (!session) {
      return handleError(new Error("Session not found")) as ErrorResponse;
    }

    return session;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createReflection(params: CreateReflectionParams) {
  const validationResult = await action({
    params: params,
    schema: CreateReflectionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { sessionId, rating, fatigue, feedback } = validationResult.params!;

  try {
    const reflection = await prisma.reflection.create({
      data: {
        sessionId,
        rating,
        fatigue,
        feedback,
      },
    });

    return reflection;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
