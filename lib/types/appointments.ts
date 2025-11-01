import z from "zod";
import { GetAppointmentsSchema } from "../validations/appointment-schemas";

export type GetAppointmentsParams = z.infer<typeof GetAppointmentsSchema>;
