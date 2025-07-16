import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"

// Replace this with your real user lookup and password verification
async function getUserByEmailAndPassword(email: string, password: string) {
  // Example: lookup user in your DB and check password hash
  // const user = await db.user.findUnique({ where: { email } })
  // if (!user) return null;
  // const isValid = await verifyPassword(password, user.hashedPassword);
  // if (!isValid) return null;
  // return user;

  // Dummy user (REMOVE in production)
  if (email === "alice@example.com" && password === "password123") {
    return {
      id: "1",
      email: "alice@example.com",
      name: "Alice Anderson",
      role: "PATIENT"
    }
  }
  return null;
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6)
        }).safeParse(credentials);

        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Look up user in DB or API
        const user = await getUserByEmailAndPassword(email, password);
        if (!user) return null;

        // You can attach extra fields (like role)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'PATIENT',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in: add role from user to token
      if (user && user.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role from token to session.user
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
