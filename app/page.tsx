import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function RootPage() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // If not authenticated, redirect to login
  redirect("/login");
}