import { UserRole, MembershipRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      organizerIds: {
        id: string
        slug: string
        role: MembershipRole
      }[]
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    organizerIds: {
      id: string
      slug: string
      role: MembershipRole
    }[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    organizerIds: {
      id: string
      slug: string
      role: MembershipRole
    }[]
  }
}
