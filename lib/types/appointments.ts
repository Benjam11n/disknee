import z from "zod";
import {
  CreateAppointmentSchema,
  GetAppointmentByIdSchema,
  GetAppointmentsSchema,
  GetUpcomingAppointmentsSchema,
} from "../validations/appointment-schemas";

export type GetAppointmentsParams = z.infer<typeof GetAppointmentsSchema>;
export type CreateAppointmentParams = z.infer<typeof CreateAppointmentSchema>;
export type GetUpcomingAppointmentsParams = z.infer<
  typeof GetUpcomingAppointmentsSchema
>;
export type GetAppointmentByIdParams = z.infer<typeof GetAppointmentByIdSchema>;
