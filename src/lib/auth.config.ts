import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// ✅ CONFIGURACIÓN CORREGIDA PARA NEXTAUTH V4 - RESUELVE CALLBACKERROR

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ✅ CONFIGURACIÓN SIMPLIFICADA - Sin parámetros extra que pueden causar conflictos
      authorization: {
        params: {
          prompt: "select_account", // Permite al usuario elegir cuenta
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

  // ✅ COOKIES SIMPLIFICADAS - Evita conflictos
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".referenciales.cl" : undefined
      }
    }
  },

  callbacks: {
    // ✅ REDIRECT CALLBACK SIMPLIFICADO - Evita bucles infinitos
    async redirect({ url, baseUrl }) {
      console.log('🔄 [AUTH-REDIRECT]', { url, baseUrl });
      
      // Si es una URL relativa, usar baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Si es del mismo dominio, permitir
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // ✅ REDIRECCIÓN POR DEFECTO SIEMPRE AL DASHBOARD
      return `${baseUrl}/dashboard`
    },
    
    // ✅ SESSION CALLBACK SIMPLIFICADO
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    
    // ✅ JWT CALLBACK SIMPLIFICADO
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    
    // ✅ SIGNIN CALLBACK - Logging simple
    async signIn({ user, account, profile }) {
      console.log('✅ [AUTH-SIGNIN]', {
        userId: user.id,
        email: user.email,
        provider: account?.provider
      });
      return true;
    }
  },
  
  // ✅ CONFIGURACIÓN DE PÁGINAS CORREGIDA
  pages: {
    signIn: "/auth/signin",
    signOut: "/", 
    error: "/auth/error", // ✅ Mantener tu página custom de error
  },
  
  // ✅ EVENTOS SIMPLIFICADOS
  events: {
    async signOut({ token }) {
      console.log('📤 [AUTH-SIGNOUT]', { tokenId: token?.sub });
    },
    async signIn({ user, account }) {
      console.log('📥 [AUTH-SIGNIN-EVENT]', { 
        userId: user.id, 
        provider: account?.provider 
      });
    }
  },
  
  // ✅ DEBUG SOLO EN DESARROLLO
  debug: process.env.NODE_ENV === "development"
}
