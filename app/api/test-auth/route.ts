import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'admin@sportsindia.com' },
      include: {
        organizerMemberships: {
          include: {
            organizer: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      userCount,
      superAdmin: superAdmin ? {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role,
        status: superAdmin.status,
        organizerMemberships: superAdmin.organizerMemberships
      } : null
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
