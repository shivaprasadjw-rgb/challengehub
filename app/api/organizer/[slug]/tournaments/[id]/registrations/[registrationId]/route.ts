import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string; registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, id, registrationId } = params
    const body = await request.json()

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Validate required fields
    const { playerName, playerEmail, playerPhone, playerAge, playerGender, playerCategory, paymentStatus } = body

    if (!playerName || !playerEmail || !playerPhone || !playerAge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if registration exists and user has access
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        tournament: {
          id,
          organizer: {
            slug
          }
        }
      },
      include: {
        tournament: true
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Check if tournament allows modifications
    if (registration.tournament.status === 'COMPLETED' || registration.tournament.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot modify registrations for completed or cancelled tournaments' }, { status: 400 })
    }

    // Check if email is already registered by another participant in this tournament
    if (playerEmail !== registration.playerEmail) {
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          tournamentId: id,
          playerEmail,
          id: {
            not: registrationId
          }
        }
      })

      if (existingRegistration) {
        return NextResponse.json({ error: 'Email already registered for this tournament' }, { status: 400 })
      }
    }

    // Update registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        playerName,
        playerEmail,
        playerPhone,
        playerAge: parseInt(playerAge),
        playerGender,
        playerCategory,
        paymentStatus
      }
    })

    return NextResponse.json({ 
      message: 'Registration updated successfully',
      registration: updatedRegistration 
    })

  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string; registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, id, registrationId } = params

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if registration exists and user has access
    const registration = await prisma.registration.findFirst({
      where: {
        id: registrationId,
        tournament: {
          id,
          organizer: {
            slug
          }
        }
      },
      include: {
        tournament: {
          include: {
            rounds: {
              include: {
                matches: true
              }
            }
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Check if tournament allows modifications
    if (registration.tournament.status === 'COMPLETED' || registration.tournament.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot delete registrations from completed or cancelled tournaments' }, { status: 400 })
    }

    // Check if tournament has started (has rounds/matches)
    const hasStarted = registration.tournament.rounds.some(round => 
      round.matches.some(match => match.isCompleted)
    )

    if (hasStarted) {
      return NextResponse.json({ error: 'Cannot delete registration from a tournament that has started' }, { status: 400 })
    }

    // Delete registration
    await prisma.registration.delete({
      where: { id: registrationId }
    })

    return NextResponse.json({ 
      message: 'Registration deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
