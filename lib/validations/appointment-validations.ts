import { z } from 'zod';

const AppointmentBaseSchema = z.object({
  start: z.date(),
  doctorName: z.string().min(1, 'Doctor name is required').max(100, 'Doctor name too long'),
  doctorSpecialty: z
    .string()
    .min(1, 'Doctor specialty is required')
    .max(100, 'Doctor specialty too long'),
  locationName: z.string().min(1, 'Location name is required').max(100, 'Location name too long'),
  locationAddr: z
    .string()
    .min(1, 'Location address is required')
    .max(500, 'Location address too long'),
});

export const CreateAppointmentSchema = AppointmentBaseSchema.extend({
  start: z.string().datetime('Invalid start date format'),
});

export const GetAppointmentsSchema = z.object({
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const GetUpcomingAppointmentsSchema = z.object({
  limit: z.coerce.number().min(1).max(10).default(3),
  daysAhead: z.coerce.number().min(1).max(365).default(30),
});

export const GetAppointmentByIdSchema = z.object({
  id: z.string(),
});
