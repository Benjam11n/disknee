import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL:
    globalThis.window == undefined
      ? env.NEXT_PUBLIC_APP_URL
      : globalThis.window.location.origin,
});
