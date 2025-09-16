import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'

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

    // Get tournaments with registration count and venue info
    const tournaments = await prisma.tournament.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        sport: true,
        date: true,
        status: true,
        maxParticipants: true,
        entryFee: true,
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
        date: 'desc'
      },
      take: limit
    })

    // Transform data to include current participants count, venue, and entry fee
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      title: tournament.title,
      sport: tournament.sport,
      date: tournament.date.toISOString(),
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament._count.registrations,
      entryFee: tournament.entryFee,
      venue: tournament.venue
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

export async function POST(
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

    const { title, sport, date, entryFee, maxParticipants, venueId } = await req.json()

    // Validation
    if (!title || !sport || !date || entryFee === undefined || !maxParticipants) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (entryFee < 0) {
      return NextResponse.json(
        { error: 'Entry fee cannot be negative' },
        { status: 400 }
      )
    }

    if (maxParticipants < 2) {
      return NextResponse.json(
        { error: 'Maximum participants must be at least 2' },
        { status: 400 }
      )
    }

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        title,
        sport,
        date: new Date(date),
        entryFee,
        maxParticipants,
        status: TournamentStatus.DRAFT,
        organizerId: organizer.id,
        venueId: venueId || null
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'CREATE_TOURNAMENT',
        entityType: 'TOURNAMENT',
        entityId: tournament.id,
        meta: {
          title,
          sport,
          entryFee,
          maxParticipants
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully',
      tournament: {
        id: tournament.id,
        title: tournament.title,
        status: tournament.status
      }
    })

  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
