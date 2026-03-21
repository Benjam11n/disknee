"use server";

import type { ExerciseSession } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { prisma } from "@/lib/prisma";
import type {
  CreateExerciseSessionParams,
  GetExerciseSessionByIdParams,
  GetExerciseSessionsParams,
} from "@/lib/types/exercise-sessions";
import {
  CreateExerciseSessionSchema,
  GetExerciseSessionsSchema,
  GetExerciseSessionByIdSchema,
} from "@/lib/validations/exercise-session-validations";

export async function createExerciseSessionAction(
  params: CreateExerciseSessionParams
): Promise<ActionResponse<ExerciseSession>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: CreateExerciseSessionSchema,
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
    exerciseId,
  } = validationResult.params!;

  try {
    const exerciseSession = await prisma.exerciseSession.create({
      data: {
        accuracy,
        duration,
        endedAt: endedAt ? new Date(endedAt) : undefined,
        exerciseId,
        maxAccuracy,
        notes,
        repsCompleted,
        startedAt: new Date(startedAt),
        videoUrl,
      },
    });

    if (!exerciseSession) {
      throw new NotFoundError("Exercise session not created");
    }

    return { data: exerciseSession, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseSessionsAction(
  params: GetExerciseSessionsParams
): Promise<ActionResponse<ExerciseSession[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetExerciseSessionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, startDate, endDate } = validationResult.params!;

  try {
    const exerciseSessions = await prisma.exerciseSession.findMany({
      include: {
        reflection: true,
      },
      orderBy: { startedAt: "desc" },
      skip: offset,
      take: limit,
      where: {
        startedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
    });

    return { data: exerciseSessions, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseSessionByIdAction(
  params: GetExerciseSessionByIdParams
): Promise<ActionResponse<ExerciseSession>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetExerciseSessionByIdSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const exerciseSession = await prisma.exerciseSession.findUnique({
      include: {
        reflection: true,
      },
      where: { id },
    });

    if (!exerciseSession) {
      throw new NotFoundError("Exercise session not found");
    }

    return { data: exerciseSession, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateExerciseSessionAction(
  sessionId: string,
  data: {
    endedAt?: Date;
    duration?: number;
    accuracy?: number;
    maxAccuracy?: number;
  }
): Promise<ActionResponse<ExerciseSession>> {
  try {
    const exerciseSession = await prisma.exerciseSession.update({
      data,
      where: { id: sessionId },
    });

    if (!exerciseSession) {
      throw new NotFoundError("Exercise session not found");
    }

    return { data: exerciseSession, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
