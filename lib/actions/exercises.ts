"use server";

import type { Exercise } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { prisma } from "@/lib/prisma";
import type {
  CreateExerciseParams,
  GetExerciseByIdParams,
  GetExercisesParams,
  UpdateExerciseDoneParams,
} from "@/lib/types/exercises";
import {
  CreateExerciseSchema,
  GetExercisesSchema,
  GetExerciseByIdSchema,
  UpdateExerciseDoneSchema,
} from "@/lib/validations/exercise-validations";

export async function createExerciseAction(
  params: CreateExerciseParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: CreateExerciseSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, estimatedMins, difficulty, done, planId } =
    validationResult.params!;

  try {
    const lastExercise = await prisma.exercise.findFirst({
      orderBy: { sequence: "desc" },
      where: { planId },
    });

    const nextSequence = lastExercise ? lastExercise.sequence + 1 : 1;

    const exercise = await prisma.exercise.create({
      data: {
        difficulty,
        done: done || false,
        estimatedMins,
        planId: planId,
        sequence: nextSequence,
        title,
      },
    });

    if (!exercise) {
      throw new NotFoundError("Exercise not created");
    }

    return { data: exercise, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExercisesAction(
  params: GetExercisesParams
): Promise<ActionResponse<Exercise[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetExercisesSchema,
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
        ? [{ sequence: "asc" }, { createdAt: "asc" }] // Order by sequence if planId is specified
        : { createdAt: "desc" }, // Default ordering for general queries
      take: limit,
      skip,
    });

    return { data: exercises, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getExerciseByIdAction(
  params: GetExerciseByIdParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetExerciseByIdSchema,
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
      throw new NotFoundError("Exercise not found");
    }

    return { data: exercise, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateExerciseDoneAction(
  params: UpdateExerciseDoneParams
): Promise<ActionResponse<Exercise>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: UpdateExerciseDoneSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, done } = validationResult.params!;

  try {
    const exercise = await prisma.exercise.update({
      data: { done },
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundError("Exercise not found");
    }

    return { data: exercise, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
