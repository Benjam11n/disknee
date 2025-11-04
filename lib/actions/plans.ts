"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  GetPlansSchema,
  GetPlansByDateRangeSchema,
  GetPlanByIdSchema,
} from "@/lib/validations/plan-validations";
import {
  GetPlanByIdParams,
  GetPlansByDateRangeParams,
  GetPlansParams,
} from "@/lib/types/plans";
import { Plan } from "@prisma/client";
import { NotFoundError } from "@/lib/http-errors";

export async function getPlansAction(
  params: GetPlansParams
): Promise<ActionResponse<Plan[]>> {
  const validationResult = await action({
    params: params,
    schema: GetPlansSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate, limit, offset } = validationResult.params!;

  try {
    const plans = await prisma.plan.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { date: "asc" },
      take: limit,
      skip: offset,
    });

    return { success: true, data: plans };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPlanByIdAction(
  params: GetPlanByIdParams
): Promise<ActionResponse<Plan>> {
  const validationResult = await action({
    params: params,
    schema: GetPlanByIdSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundError("Plan not found");
    }

    return { success: true, data: plan };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
