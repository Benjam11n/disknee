import type z from "zod";

import type {
  CreateAppointmentSchema,
  GetAppointmentByIdSchema,
  GetAppointmentsSchema,
  GetUpcomingAppointmentsSchema,
} from "@/lib/validations/appointment-validations";

export type GetAppointmentsParams = z.infer<typeof GetAppointmentsSchema>;
export type CreateAppointmentParams = z.infer<typeof CreateAppointmentSchema>;
export type GetUpcomingAppointmentsParams = z.infer<
  typeof GetUpcomingAppointmentsSchema
>;
export type GetAppointmentByIdParams = z.infer<typeof GetAppointmentByIdSchema>;
