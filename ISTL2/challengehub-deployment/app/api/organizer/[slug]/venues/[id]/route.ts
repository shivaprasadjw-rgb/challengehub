import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    // Check if venue exists and belongs to this organizer
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const { name, city, state, locality, pincode, address } = await req.json()

    // Validation
    if (!name || !city || !state || !pincode || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update venue
    const venue = await prisma.venue.update({
      where: { id: params.id },
      data: {
        name,
        city,
        state,
        locality: locality || null,
        pincode,
        address
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'UPDATE_VENUE',
        entityType: 'VENUE',
        entityId: venue.id,
        meta: {
          venueName: venue.name,
          city: venue.city,
          state: venue.state
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Venue updated successfully',
      venue: {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state
      }
    })

  } catch (error) {
    console.error('Error updating venue:', error)
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

    // Check if venue exists and belongs to this organizer
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Check if venue is being used by any tournaments
    const tournamentsUsingVenue = await prisma.tournament.count({
      where: { venueId: params.id }
    })

    if (tournamentsUsingVenue > 0) {
      return NextResponse.json(
        { error: 'Cannot delete venue as it is being used by tournaments' },
        { status: 400 }
      )
    }

    // Delete venue
    await prisma.venue.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'DELETE_VENUE',
        entityType: 'VENUE',
        entityId: params.id,
        meta: {
          venueName: existingVenue.name,
          city: existingVenue.city,
          state: existingVenue.state
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Venue deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
