"use server";

import { prisma } from "@/lib/prisma";
import action from "@/lib/handlers/action";
import { GetAppointmentsSchema } from "@/lib/validations/appointment-schemas";

import handleError from "@/lib/handlers/error";
import { GetAppointmentsParams } from "@/lib/types/appointments";

export async function getAppointments(params: GetAppointmentsParams) {
  const validationResult = await action({
    params: params,
    schema: GetAppointmentsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, limit, offset } = validationResult.params!;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        start: startDate ? { gte: new Date(startDate) } : undefined,
      },
      orderBy: { start: "asc" },
      take: limit,
      skip: offset,
    });

    return appointments;
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
