import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "../env";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false, // Allow shorter passwords for demo
  },
  plugins: [nextCookies()],
  secret: env.BETTER_AUTH_SECRET,
});

export type Session = typeof auth.$Infer.Session;
