"use server";

import { Reflection } from "@prisma/client";
import { CreateReflectionParams } from "@/lib/types/sessions";
import action from "@/lib/handlers/action";
import { CreateReflectionSchema } from "@/lib/validations/session-schemas";
import handleError from "@/lib/handlers/error";
import { prisma } from "@/lib/prisma";

export async function createReflectionAction(
  params: CreateReflectionParams
): Promise<ActionResponse<Reflection>> {
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

    return { success: true, data: reflection };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
