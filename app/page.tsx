import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log(session, "session");

  if (session?.user) {
    redirect(ROUTES.DASHBOARD);
  }

  return <LandingPage />;
}
