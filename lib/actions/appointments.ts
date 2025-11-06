'use server';

import { prisma } from '@/lib/prisma';
import { action } from '@/lib/handlers/action';
import { handleError } from '@/lib/handlers/error';
import {
  CreateAppointmentSchema,
  GetAppointmentsSchema,
  GetUpcomingAppointmentsSchema,
  GetAppointmentByIdSchema,
} from '@/lib/validations/appointment-validations';
import {
  CreateAppointmentParams,
  GetAppointmentByIdParams,
  GetAppointmentsParams,
  GetUpcomingAppointmentsParams,
} from '@/lib/types/appointments';
import { Appointment } from '@prisma/client';

export async function createAppointmentAction(
  params: CreateAppointmentParams
): Promise<ActionResponse<Appointment>> {
  const validationResult = await action({
    params: params,
    schema: CreateAppointmentSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { start, doctorName, doctorSpecialty, locationName, locationAddr } =
    validationResult.params!;

  try {
    const appointment = await prisma.appointment.create({
      data: {
        start: new Date(start),
        doctorName,
        doctorSpecialty,
        locationName,
        locationAddr,
      },
    });

    return { success: true, data: appointment };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAppointmentsAction(
  params: GetAppointmentsParams
): Promise<ActionResponse<Appointment[]>> {
  const validationResult = await action({
    params: params,
    schema: GetAppointmentsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate, limit, offset } = validationResult.params!;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        start: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { start: 'asc' },
      take: limit,
      skip: offset,
    });

    return { success: true, data: appointments };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUpcomingAppointmentsAction(
  params: GetUpcomingAppointmentsParams
): Promise<ActionResponse<Appointment[]>> {
  const validationResult = await action({
    params: params,
    schema: GetUpcomingAppointmentsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { limit, daysAhead } = validationResult.params!;
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        start: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { start: 'asc' },
      take: limit,
    });

    return { success: true, data: appointments };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAppointmentByIdAction(
  params: GetAppointmentByIdParams
): Promise<ActionResponse<Appointment>> {
  const validationResult = await action({
    params: params,
    schema: GetAppointmentByIdSchema,
    authorize: true,
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
      return handleError(new Error('Appointment not found')) as ErrorResponse;
    }

    return { success: true, data: appointment };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
