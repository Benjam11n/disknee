"use server";

import type { Appointment } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { prisma } from "@/lib/prisma";
import type {
  CreateAppointmentParams,
  GetAppointmentByIdParams,
  GetAppointmentsParams,
  GetUpcomingAppointmentsParams,
} from "@/lib/types/appointments";
import {
  CreateAppointmentSchema,
  GetAppointmentsSchema,
  GetUpcomingAppointmentsSchema,
  GetAppointmentByIdSchema,
} from "@/lib/validations/appointment-validations";

export async function createAppointmentAction(
  params: CreateAppointmentParams
): Promise<ActionResponse<Appointment>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: CreateAppointmentSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { start, doctorName, doctorSpecialty, locationName, locationAddr } =
    validationResult.params!;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        doctorName,
        doctorSpecialty,
        locationAddr,
        locationName,
        start: new Date(start),
      },
    });

    return { data: appointment, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAppointmentsAction(
  params: GetAppointmentsParams
): Promise<ActionResponse<Appointment[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetAppointmentsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate, limit, offset } = validationResult.params!;

  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: "asc" },
      skip: offset,
      take: limit,
      where: {
        start: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
    });

    return { data: appointments, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUpcomingAppointmentsAction(
  params: GetUpcomingAppointmentsParams
): Promise<ActionResponse<Appointment[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetUpcomingAppointmentsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, daysAhead } = validationResult.params!;
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { start: "asc" },
      take: limit,
      where: {
        start: {
          gte: now,
          lte: futureDate,
        },
      },
    });

    return { data: appointments, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAppointmentByIdAction(
  params: GetAppointmentByIdParams
): Promise<ActionResponse<Appointment>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetAppointmentByIdSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id } = validationResult.params!;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return handleError(new Error("Appointment not found")) as ErrorResponse;
    }

    return { data: appointment, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
