import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarNavigation } from "@/components/shared/layout/sidebar-navigation";
import { Navbar } from "@/components/shared/navbar";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";
import { logger } from "@/lib/logger";

export default async function AuthenticatedLayout({
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
      "Unauthorized access attempt, redirecting to login"
    );
    redirect(ROUTES.LOGIN);
  }

  logger.info(
    {
      email: session.user.email,
      userId: session.user.id,
    },
    "User authenticated successfully"
  );

  const appointmentsResponse = await getAppointmentsAction({
    limit: 1,
    offset: 0,
  });

  if (!appointmentsResponse.success || !appointmentsResponse.data) {
    logger.error({
      error: appointmentsResponse.error,
      userId: session.user.id,
    });
  }

  const nextAppointment = appointmentsResponse.data?.[0];

  if (nextAppointment) {
    logger.debug(
      {
        appointmentDate: nextAppointment.start,
        appointmentId: nextAppointment.id,
        userId: session.user.id,
      },
      "Next appointment found"
    );
  }

  return (
    <SidebarNavigation>
      <Navbar nextAppt={nextAppointment} />
      {children}
    </SidebarNavigation>
  );
}
