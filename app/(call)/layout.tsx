import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";

export default async function CallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    logger.info(
      {
        ip: headersList.get("x-forwarded-for") || "unknown",
      },
      "Unauthorized access attempt to call page, redirecting to login"
    );
    redirect(ROUTES.LOGIN);
  }

  logger.info(
    {
      email: session.user.email,
      userId: session.user.id,
    },
    "User accessing call page"
  );

  return <>{children}</>;
}
