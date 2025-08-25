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

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // Build where clause
    const whereClause: any = { organizerId: organizer.id }
    if (status) {
      whereClause.status = status
    }

    // Get tournaments with registration count
    const tournaments = await prisma.tournament.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        sport: true,
        date: true,
        status: true,
        maxParticipants: true,
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    })

    // Transform data to include current participants count
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      title: tournament.title,
      sport: tournament.sport,
      date: tournament.date.toISOString(),
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament._count.registrations
    }))

    return NextResponse.json({
      tournaments: transformedTournaments
    })

  } catch (error) {
    console.error('Error fetching organizer tournaments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
