import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Configuración optimizada para NextAuth v4 basada en documentación oficial

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
          scope: "openid email profile"
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
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // En producción, asegurar que las cookies sean seguras
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    // Callback de redirect personalizado para manejar URLs correctamente
    async redirect({ url, baseUrl }) {
      console.log('🔄 [AUTH-REDIRECT]', { url, baseUrl });
      
      // Si la URL es relativa, usar baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Si la URL pertenece al mismo dominio, permitirla
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`;
    },
    
    async session({ session, token }) {
      // Extender la sesión con información adicional del token
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role || "USER";
      }
      return session;
    },
    
    async jwt({ token, user, account }) {
      // En el primer login, agregar información del usuario al token
      if (user) {
        token.role = user.role || "USER";
      }
      return token;
    },
    
    async signIn({ user, account, profile }) {
      try {
        console.log('✅ [AUTH-SIGNIN]', {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          timestamp: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.error('❌ [AUTH-SIGNIN-ERROR]:', error);
        return false;
      }
    }
  },
  
  // Configuración de páginas personalizada - CORREGIDO: usar ruta correcta
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error", // ✅ CORREGIDO: debe ser /auth/error
  },
  
  events: {
    async signOut(message) {
      console.log('📤 [AUTH-SIGNOUT]', {
        token: message.token?.sub,
        session: message.session?.user?.id,
        timestamp: new Date().toISOString()
      });
    },
    async signIn(message) {
      console.log('📥 [AUTH-SIGNIN-EVENT]', {
        user: message.user.id,
        account: message.account?.provider,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  // Solo habilitar debug en desarrollo
  debug: process.env.NODE_ENV === "development" && process.env.NEXTAUTH_DEBUG === "true"
}
