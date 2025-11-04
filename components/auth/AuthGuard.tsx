"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback = <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>,
  redirectTo = "/login"
}: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect if not authenticated
  if (!isPending && !session) {
    router.push(redirectTo);
    return null;
  }

  // Show loading while checking auth
  if (isPending) {
    return fallback;
  }

  // Render children if authenticated
  return <>{children}</>;
}