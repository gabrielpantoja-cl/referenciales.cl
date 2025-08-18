import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin' | 'superadmin'
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    role?: 'user' | 'admin' | 'superadmin'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: 'user' | 'admin' | 'superadmin'
  }
}