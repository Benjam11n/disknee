import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type { Session } from "@/lib/auth";
import { updateSession } from "@/utils/supabase/middleware";

import { ROUTES } from "./lib/constants/routes";
import { logger } from "./lib/logger";

const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN];

async function getSession(request: NextRequest): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session ?? null;
  } catch (error) {
    logger.error(error, "Failed to fetch session:");
    return null;
  }
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });
}

function handleAuth(
  request: NextRequest,
  session: Session | null,
  response: NextResponse
): Promise<NextResponse> {
  const pathName = request.nextUrl.pathname;
  if ((PUBLIC_ROUTES as readonly string[]).includes(pathName)) {
    return response;
  }

  if (!session) {
    const redirectResponse = NextResponse.redirect(
      new URL(ROUTES.HOME, request.url)
    );
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  // Exclude static assets and auth API routes
  if (
    pathName.startsWith("/images/") ||
    pathName.startsWith("/icon/") ||
    pathName.startsWith("/logo/") ||
    pathName.startsWith("/api/auth/") || // Exclude Better Auth API routes
    pathName.endsWith(".mp4") ||
    pathName.endsWith(".webm") ||
    pathName.endsWith(".mov") ||
    pathName.endsWith(".avi")
  ) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const session = await getSession(request);
  return handleAuth(request, session, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
