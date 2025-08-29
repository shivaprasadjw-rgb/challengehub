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

    const tournaments = await prisma.tournament.findMany({
      take: 10, // Latest 10 tournaments
      include: {
        organizer: {
          select: {
            name: true,
            slug: true
          }
        },
        venue: {
          select: {
            name: true,
            city: true
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      tournaments: tournaments.map(tournament => ({
        id: tournament.id,
        title: tournament.title,
        sport: tournament.sport,
        status: tournament.status,
        date: tournament.date.toISOString(),
        organizer: {
          name: tournament.organizer.name,
          slug: tournament.organizer.slug
        },
        venue: tournament.venue ? {
          name: tournament.venue.name,
          city: tournament.venue.city
        } : null,
        _count: {
          registrations: tournament._count.registrations
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching tournament analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
