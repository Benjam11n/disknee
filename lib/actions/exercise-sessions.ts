'use server';

import { prisma } from '@/lib/prisma';
import { action } from '@/lib/handlers/action';
import { handleError } from '@/lib/handlers/error';
import {
  CreateExerciseSessionSchema,
  GetExerciseSessionsSchema,
  GetExerciseSessionByIdSchema,
} from '@/lib/validations/exercise-session-validations';
import {
  CreateExerciseSessionParams,
  GetExerciseSessionByIdParams,
  GetExerciseSessionsParams,
} from '@/lib/types/exercise-sessions';
import { ExerciseSession } from '@prisma/client';
import { NotFoundError } from '@/lib/http-errors';

export async function createExerciseSessionAction(
  params: CreateExerciseSessionParams
): Promise<ActionResponse<ExerciseSession>> {
  const validationResult = await action({
    params: params,
    schema: CreateExerciseSessionSchema,
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
    exerciseId,
  } = validationResult.params!;

  try {
    const exerciseSession = await prisma.exerciseSession.create({
      data: {
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : undefined,
        duration,
        repsCompleted,
        accuracy,
        maxAccuracy,
        videoUrl,
        notes,
        exerciseId,
      },
    });

    if (!exerciseSession) {
      throw new NotFoundError('Exercise session not created');
    }

    return { success: true, data: exerciseSession };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseSessionsAction(
  params: GetExerciseSessionsParams
): Promise<ActionResponse<ExerciseSession[]>> {
  const validationResult = await action({
    params: params,
    schema: GetExerciseSessionsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, offset, startDate, endDate } = validationResult.params!;

  try {
    const exerciseSessions = await prisma.exerciseSession.findMany({
      where: {
        startedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        reflection: true,
      },
    });

    return { success: true, data: exerciseSessions };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseSessionByIdAction(
  params: GetExerciseSessionByIdParams
): Promise<ActionResponse<ExerciseSession>> {
  const validationResult = await action({
    params: params,
    schema: GetExerciseSessionByIdSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const exerciseSession = await prisma.exerciseSession.findUnique({
      where: { id },
      include: {
        reflection: true,
      },
    });

    if (!exerciseSession) {
      throw new NotFoundError('Exercise session not found');
    }

    return { success: true, data: exerciseSession };
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
      where: { id: sessionId },
      data,
    });

    if (!exerciseSession) {
      throw new NotFoundError('Exercise session not found');
    }

    return { success: true, data: exerciseSession };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
