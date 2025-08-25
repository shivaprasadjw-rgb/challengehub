import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applications = await prisma.organizerApplication.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        organizer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        submittedAt: 'asc'
      }
    })

    return NextResponse.json({
      applications: applications.map(app => ({
        id: app.id,
        orgName: app.orgName,
        user: {
          name: app.user.name,
          email: app.user.email
        },
        submittedAt: app.submittedAt.toISOString(),
        status: app.status,
        docsURL: app.docsURL
      }))
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
