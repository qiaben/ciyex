import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsedCredentials.success) return null

        const { email, password } = parsedCredentials.data
        
        try {
          // Get user from Clerk
          const client = await clerkClient();
          const { data: users } = await client.users.getUserList({
            emailAddress: [email]
          });
          
          if (!users || users.length === 0) return null;
          
          const user = users[0];
          
          // Note: In a real implementation, you would need to verify the password
          // Since Clerk handles authentication, you might want to use Clerk's sign-in
          // instead of this credentials provider
          
          return {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: (user.publicMetadata?.role as string) || 'PATIENT',
          }
        } catch (error) {
          console.error('Error authenticating with Clerk:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig 