import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === params.slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Get counts for different metrics
    const [totalTournaments, activeTournaments, totalVenues, totalJudges, totalRegistrations] = await Promise.all([
      prisma.tournament.count({
        where: { organizerId: organizer.id }
      }),
      prisma.tournament.count({
        where: { 
          organizerId: organizer.id,
          status: 'ACTIVE'
        }
      }),
      prisma.venue.count({
        where: { organizerId: organizer.id }
      }),
      prisma.judge.count({
        where: { organizerId: organizer.id }
      }),
      prisma.registration.count({
        where: { 
          tournament: { organizerId: organizer.id }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalTournaments,
        activeTournaments,
        totalVenues,
        totalJudges,
        totalRegistrations
      }
    })

  } catch (error) {
    console.error('Error fetching organizer stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
