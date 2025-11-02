"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  CreateSessionSchema,
  GetSessionsSchema,
  GetSessionByIdSchema,
} from "@/lib/validations/session-schemas";
import {
  CreateSessionParams,
  GetSessionByIdParams,
  GetSessionsParams,
} from "@/lib/types/sessions";
import { Session } from "@prisma/client";
import { NotFoundError } from "@/lib/http-errors";

export async function createSessionAction(
  params: CreateSessionParams
): Promise<ActionResponse<Session>> {
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
    exerciseId,
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
        exerciseId,
      },
    });

    if (!session) {
      throw new NotFoundError("Session not created");
    }

    return { success: true, data: session };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSessionsAction(
  params: GetSessionsParams
): Promise<ActionResponse<Session[]>> {
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

    return { success: true, data: sessions };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSessionByIdAction(
  params: GetSessionByIdParams
): Promise<ActionResponse<Session>> {
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
      throw new NotFoundError("Session not found");
    }

    return { success: true, data: session };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateSessionAction(
  sessionId: string,
  data: {
    endedAt?: Date;
    duration?: number;
    accuracy?: number;
    maxAccuracy?: number;
  }
): Promise<ActionResponse<Session>> {
  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data,
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    return { success: true, data: session };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
