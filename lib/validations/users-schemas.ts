import z from "zod";

export const GetUserByIdSchema = z.object({
  userId: z.string().cuid(),
});
