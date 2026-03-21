"use server";

import type { Plan } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { prisma } from "@/lib/prisma";
import type { GetPlanByIdParams, GetPlansParams } from "@/lib/types/plans";
import {
  GetPlansSchema,
  GetPlanByIdSchema,
} from "@/lib/validations/plan-validations";

export async function getPlansAction(
  params: GetPlansParams
): Promise<ActionResponse<Plan[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetPlansSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate, limit, offset } = validationResult.params!;

  try {
    const plans = await prisma.plan.findMany({
      orderBy: { date: "asc" },
      skip: offset,
      take: limit,
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
    });

    return { data: plans, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPlanByIdAction(
  params: GetPlanByIdParams
): Promise<ActionResponse<Plan>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetPlanByIdSchema,
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

    return { data: plan, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
