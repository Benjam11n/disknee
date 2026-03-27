import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

import { HelpClient } from "./help-client";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Support resources, FAQs, and recovery guidance for DisKnee patients.",
};

export default async function HelpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  return <HelpClient />;
}
