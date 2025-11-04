import z from "zod";

export const GetUserByIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});
