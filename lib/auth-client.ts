import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    globalThis.window == undefined
      ? process.env.NEXT_PUBLIC_APP_URL
      : globalThis.window.location.origin,
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
