import { auth } from "./auth";

export async function createSeedUser(userCred: {
  name: string;
  email: string;
  password: string;
}) {
  // Create user using Better Auth's internal API
  const user = await auth.api.signUpEmail({
    body: {
      email: userCred.email,
      password: userCred.password,
      name: userCred.name,
    },
  });

  if (!user || !user.user) {
    throw new Error(`Failed to create user: ${userCred.email}`);
  }

  // The user is already created in the database by Better Auth
  // Return the user object
  return user.user;
}
