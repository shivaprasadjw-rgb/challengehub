import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    // Get tournament with registrations
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            locality: true,
            state: true
          }
        },
        registrations: {
          select: {
            id: true,
            playerName: true,
            playerEmail: true,
            playerPhone: true,
            playerAge: true,
            playerGender: true,
            playerCategory: true,
            paymentStatus: true,
            registeredAt: true
          },
          orderBy: {
            registeredAt: 'desc'
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Transform data
    const transformedTournament = {
      id: tournament.id,
      title: tournament.title,
      sport: tournament.sport,
      date: tournament.date.toISOString(),
      status: tournament.status,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.registrations.length,
      entryFee: tournament.entryFee,
      venue: tournament.venue,
      registrations: tournament.registrations.map(reg => ({
        id: reg.id,
        playerName: reg.playerName,
        playerEmail: reg.playerEmail,
        playerPhone: reg.playerPhone,
        playerAge: reg.playerAge,
        playerGender: reg.playerGender,
        playerCategory: reg.playerCategory,
        paymentStatus: reg.paymentStatus,
        registeredAt: reg.registeredAt.toISOString()
      }))
    }

    return NextResponse.json({
      tournament: transformedTournament
    })

  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    // Check if tournament exists and belongs to this organizer
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const { title, sport, date, entryFee, maxParticipants, venueId, status } = await req.json()

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

    // Update tournament
    const updatedTournament = await prisma.tournament.update({
      where: { id: params.id },
      data: {
        title,
        sport,
        date: new Date(date),
        entryFee,
        maxParticipants,
        status: status || existingTournament.status,
        venueId: venueId || null
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'UPDATE_TOURNAMENT',
        entityType: 'TOURNAMENT',
        entityId: updatedTournament.id,
        meta: {
          title,
          sport,
          entryFee,
          maxParticipants,
          status: status || existingTournament.status
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tournament updated successfully',
      tournament: {
        id: updatedTournament.id,
        title: updatedTournament.title,
        status: updatedTournament.status
      }
    })

  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    // Check if tournament exists and belongs to this organizer
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })

    if (!existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if tournament has registrations
    if (existingTournament._count.registrations > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tournament with existing registrations' },
        { status: 400 }
      )
    }

    // Delete tournament
    await prisma.tournament.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'DELETE_TOURNAMENT',
        entityType: 'TOURNAMENT',
        entityId: params.id,
        meta: {
          title: existingTournament.title
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tournament deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
