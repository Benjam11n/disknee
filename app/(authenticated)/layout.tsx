import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { Navbar } from "@/components/Navbar";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarNavigation>
      <Navbar
        label="Dashboard"
        primaryDoctorText="Smith"
      />
      {children}
    </SidebarNavigation>
  );
}