import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarNavigation } from "@/components/shared/layout/sidebar-navigation";
import { Navbar } from "@/components/shared/navbar";
import { ROUTES } from "@/lib/constants/routes";
import { getAppointmentsAction } from "@/lib/actions/appointments";
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
      userId: session.user.id,
      email: session.user.email,
    },
    "User authenticated successfully"
  );

  const appointmentsResponse = await getAppointmentsAction({
    offset: 0,
    limit: 1,
  });

  if (!appointmentsResponse.success || !appointmentsResponse.data) {
    logger.error({
      userId: session.user.id,
      error: appointmentsResponse.error,
    });
  }

  const nextAppointment = appointmentsResponse.data?.[0];

  if (nextAppointment) {
    logger.debug(
      {
        userId: session.user.id,
        appointmentId: nextAppointment.id,
        appointmentDate: nextAppointment.start,
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
