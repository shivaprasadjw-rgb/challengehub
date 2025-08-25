import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { UserRole, UserStatus, MembershipRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            organizerMemberships: {
              include: {
                organizer: true
              }
            }
          }
        })

        if (!user || user.status !== UserStatus.ACTIVE) {
          return null
        }

        if (user.passwordHash) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isPasswordValid) {
            return null
          }
        } else {
          // Handle users without passwordHash if needed, e.g., OAuth users
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizerIds: user.organizerMemberships.map(m => ({
            id: m.organizer.id,
            slug: m.organizer.slug,
            role: m.role
          }))
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizerIds = user.organizerIds
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as UserRole
        session.user.organizerIds = token.organizerIds as { id: string; slug: string; role: MembershipRole }[]
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt"
  }
}

// Helper functions for role-based access control (simplified for now)
export function requireRole(role: UserRole) {
  return function(req: any, res: any, next: any) {
    if (req.session?.user?.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}

export function requireOrganizerAccess(organizerSlug: string) {
  return function(req: any, res: any, next: any) {
    const user = req.session?.user
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (user.role === UserRole.SUPER_ADMIN) {
      return next()
    }
    
    const hasAccess = user.organizerIds?.some((org: any) => org.slug === organizerSlug)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this organizer' })
    }
    
    next()
  }
}
