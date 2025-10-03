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

    // Get venues
    const venues = await prisma.venue.findMany({
      where: { organizerId: organizer.id },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        locality: true,
        pincode: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      venues
    })

  } catch (error) {
    console.error('Error fetching organizer venues:', error)
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

    const { name, city, state, locality, pincode, address } = await req.json()

    // Validation
    if (!name || !city || !state || !pincode || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name,
        city,
        state,
        locality: locality || null,
        pincode,
        address,
        organizerId: organizer.id
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'CREATE_VENUE',
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
      message: 'Venue created successfully',
      venue: {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state
      }
    })

  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
