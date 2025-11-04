import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { Navbar } from "@/components/Navbar";
import { ROUTES } from "@/lib/constants/routes";
import { getAppointmentsAction } from "@/lib/actions/appointments";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const appointmentsResponse = await getAppointmentsAction({
    offset: 0,
    limit: 1,
  });

  if (!appointmentsResponse.success || !appointmentsResponse.data) {
    console.error(
      appointmentsResponse.error?.message ?? `Failed to fetch appointments`
    );
  }

  const nextAppointment = appointmentsResponse.data?.[0];

  return (
    <SidebarNavigation>
      <Navbar nextAppt={nextAppointment} />
      {children}
    </SidebarNavigation>
  );
}
