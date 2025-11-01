"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  GetPlansSchema,
  GetPlansByDateRangeSchema,
  GetPlanByIdSchema,
} from "@/lib/validations/plan-schemas";
import {
  GetPlanByIdParams,
  GetPlansByDateRangeParams,
  GetPlansParams,
} from "../types/plans";

export async function getPlans(params: GetPlansParams) {
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

    return plans;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPlansByDateRange(params: GetPlansByDateRangeParams) {
  const validationResult = await action({
    params: params,
    schema: GetPlansByDateRangeSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate } = validationResult.params!;

  try {
    const plans = await prisma.plan.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: "asc" },
    });

    return plans;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPlanById(params: GetPlanByIdParams) {
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
      return handleError(new Error("Plan not found")) as ErrorResponse;
    }

    return plan;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
