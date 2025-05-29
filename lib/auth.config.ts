import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Configuración para NextAuth v4

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent"
        }
      }
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.sub,
          role: token.role || "USER",
          email: token.email,
          name: session.user?.name
        }
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "USER"
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Log exitoso de signIn
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ [AUTH] SignIn successful', {
          userId: user.id,
          provider: account?.provider,
          timestamp: new Date().toISOString()
        });
      }
      return true;
    },
    async signOut({ token }) {
      // Log exitoso de signOut
      if (process.env.NODE_ENV === 'production') {
        console.log('✅ [AUTH] SignOut successful', {
          userId: token?.sub,
          timestamp: new Date().toISOString()
        });
      }
      return true;
    }
  },
  pages: {
    signIn: "/login",
    signOut: "/", // Redirigir al home tras signOut
    error: "/error",
  },
  events: {
    async signOut(message) {
      console.log('📤 [AUTH-EVENT] User signed out', {
        token: message.token?.sub,
        session: message.session?.user?.id,
        timestamp: new Date().toISOString()
      });
    },
    async signIn(message) {
      console.log('📥 [AUTH-EVENT] User signed in', {
        user: message.user.id,
        account: message.account?.provider,
        timestamp: new Date().toISOString()
      });
    }
  },
  debug: process.env.NODE_ENV === "development"
}