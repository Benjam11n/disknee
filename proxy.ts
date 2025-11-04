import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "@/lib/auth";
import { ROUTES } from "./lib/constants/routes";

const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN];

async function getSession(request: NextRequest): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session ?? null;
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return null;
  }
}

async function handleAuth(
  request: NextRequest,
  session: Session | null
): Promise<NextResponse> {
  const pathName = request.nextUrl.pathname;
  if ((PUBLIC_ROUTES as readonly string[]).includes(pathName)) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  if (
    pathName.startsWith("/images/") ||
    pathName.startsWith("/icon/") ||
    pathName.startsWith("/logo/")
  ) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  return handleAuth(request, session);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
