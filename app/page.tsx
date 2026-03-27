import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/shared/landing/landing-page";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "DisKnee",
  description:
    "AI-guided knee rehabilitation with live exercise feedback and progress tracking.",
};

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(ROUTES.DASHBOARD);
  }

  return <LandingPage />;
}
