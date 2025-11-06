'use server';

import { prisma } from '@/lib/prisma';
import { action } from '@/lib/handlers/action';
import { handleError } from '@/lib/handlers/error';
import {
  CreateExerciseSchema,
  GetExercisesSchema,
  GetExerciseByIdSchema,
  UpdateExerciseDoneSchema,
} from '@/lib/validations/exercise-validations';
import {
  CreateExerciseParams,
  GetExerciseByIdParams,
  GetExercisesParams,
  UpdateExerciseDoneParams,
} from '@/lib/types/exercises';
import { Exercise } from '@prisma/client';
import { NotFoundError } from '@/lib/http-errors';

export async function createExerciseAction(
  params: CreateExerciseParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    params: params,
    schema: CreateExerciseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, estimatedMins, difficulty, done, planId } = validationResult.params!;

  try {
    const lastExercise = await prisma.exercise.findFirst({
      where: { planId },
      orderBy: { sequence: 'desc' },
    });

    const nextSequence = lastExercise ? lastExercise.sequence + 1 : 1;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        estimatedMins,
        difficulty,
        done: done || false,
        sequence: nextSequence,
        planId: planId,
      },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not created');
    }

    return { success: true, data: exercise };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExercisesAction(
  params: GetExercisesParams
): Promise<ActionResponse<Exercise[]>> {
  const validationResult = await action({
    params: params,
    schema: GetExercisesSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { difficulty, done, planId, page, limit } = validationResult.params!;
  const skip = (page - 1) * limit;

  try {
    const exercises = await prisma.exercise.findMany({
      where: {
        difficulty: difficulty || undefined,
        done: done !== undefined ? done : undefined,
        planId: planId || undefined,
      },
      orderBy: planId
        ? [{ sequence: 'asc' }, { createdAt: 'asc' }] // Order by sequence if planId is specified
        : { createdAt: 'desc' }, // Default ordering for general queries
      take: limit,
      skip,
    });

    return { success: true, data: exercises };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseByIdAction(
  params: GetExerciseByIdParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    params: params,
    schema: GetExerciseByIdSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    return { success: true, data: exercise };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateExerciseDoneAction(
  params: UpdateExerciseDoneParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    params: params,
    schema: UpdateExerciseDoneSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, done } = validationResult.params!;

  try {
    const exercise = await prisma.exercise.update({
      where: { id },
      data: { done },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    return { success: true, data: exercise };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
