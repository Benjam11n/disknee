import type { User } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { prisma } from "@/lib/prisma";
import type { GetUserByIdParams } from "@/lib/types/users";
import { GetUserByIdSchema } from "@/lib/validations/users-validations";

export async function getUserByIdAction(
  params: GetUserByIdParams
): Promise<ActionResponse<User>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetUserByIdSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { data: user, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
