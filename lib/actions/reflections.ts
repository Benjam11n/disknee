"use server";

import type { Reflection } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { prisma } from "@/lib/prisma";
import type { CreateReflectionParams } from "@/lib/types/exercise-sessions";
import { CreateReflectionSchema } from "@/lib/validations/exercise-session-validations";

export async function createReflectionAction(
  params: CreateReflectionParams
): Promise<ActionResponse<Reflection>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: CreateReflectionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { exerciseSessionId, rating, fatigue, feedback } =
    validationResult.params!;

  try {
    const reflection = await prisma.reflection.create({
      data: {
        exerciseSessionId,
        fatigue,
        feedback,
        rating,
      },
    });

    return { data: reflection, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
