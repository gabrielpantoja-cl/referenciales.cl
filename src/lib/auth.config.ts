import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// ✅ CONFIGURACIÓN CORREGIDA PARA NEXTAUTH V4 - RESUELVE BUCLE INFINITO OAUTH

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ✅ CONFIGURACIÓN SIMPLIFICADA - Sin parámetros extra que pueden causar conflictos
      authorization: {
        params: {
          prompt: "select_account", // Permite al usuario elegir cuenta
          scope: "openid email profile" // Explícito para evitar problemas
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

  // ✅ COOKIES SIMPLIFICADAS - CORRIGE PROBLEMAS DE DOMINIO
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
        // ✅ REMOVIDO DOMINIO ESPECÍFICO - Causa problemas en producción
        // domain: process.env.NODE_ENV === "production" ? ".referenciales.cl" : undefined
      }
    }
  },

  callbacks: {
    // ✅ REDIRECT CALLBACK CORREGIDO - ELIMINA BUCLES INFINITOS
    async redirect({ url, baseUrl }) {
      console.log('🔄 [AUTH-REDIRECT]', { url, baseUrl, NODE_ENV: process.env.NODE_ENV });
      
      // Si la URL es relativa, construir URL completa
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('🔄 [AUTH-REDIRECT] Relative URL converted:', fullUrl);
        return fullUrl;
      }
      
      // Si es del mismo origen, permitir
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('🔄 [AUTH-REDIRECT] Same origin allowed:', url);
          return url;
        }
      } catch (error) {
        console.error('🔄 [AUTH-REDIRECT] URL parsing error:', error);
      }
      
      // ✅ REDIRECCIÓN POR DEFECTO AL DASHBOARD
      const defaultUrl = `${baseUrl}/dashboard`;
      console.log('🔄 [AUTH-REDIRECT] Default redirect:', defaultUrl);
      return defaultUrl;
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
    
    // ✅ SIGNIN CALLBACK - LOGGING Y VALIDACIÓN
    async signIn({ user, account, profile }) {
      console.log('✅ [AUTH-SIGNIN]', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      });
      
      // Validar que tenemos los datos mínimos necesarios
      if (!user.email) {
        console.error('❌ [AUTH-SIGNIN] No email provided');
        return false;
      }
      
      return true;
    }
  },
  
  // ✅ CONFIGURACIÓN DE PÁGINAS CORREGIDA
  pages: {
    signIn: "/auth/signin",
    signOut: "/", 
    error: "/auth/error",
  },
  
  // ✅ EVENTOS SIMPLIFICADOS
  events: {
    async signOut({ token }) {
      console.log('📤 [AUTH-SIGNOUT]', { 
        tokenId: token?.sub,
        timestamp: new Date().toISOString() 
      });
    },
    async signIn({ user, account }) {
      console.log('📥 [AUTH-SIGNIN-EVENT]', { 
        userId: user.id, 
        provider: account?.provider,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // ✅ DEBUG HABILITADO PARA IDENTIFICAR PROBLEMAS
  debug: true // Habilitado tanto en dev como en producción para diagnosticar
}
