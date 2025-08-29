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

    const organizers = await prisma.organizer.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tournaments: true,
            venues: true,
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      organizers: organizers.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt.toISOString(),
        owner: {
          name: org.owner.name,
          email: org.owner.email
        },
        _count: {
          tournaments: org._count.tournaments,
          venues: org._count.venues,
          members: org._count.members
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching organizers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
