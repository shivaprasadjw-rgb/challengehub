import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, id } = params
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

    // Check if tournament exists and user has access
    const tournament = await prisma.tournament.findFirst({
      where: {
        id,
        organizer: {
          slug
        }
      },
      include: {
        registrations: true
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if tournament allows modifications
    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot modify registrations for completed or cancelled tournaments' }, { status: 400 })
    }

    // Check if tournament is full
    if (tournament.registrations.length >= tournament.maxParticipants) {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 })
    }

    // Check if email is already registered for this tournament
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        tournamentId: id,
        playerEmail
      }
    })

    if (existingRegistration) {
      return NextResponse.json({ error: 'Email already registered for this tournament' }, { status: 400 })
    }

    // Create or find user
    let user = await prisma.user.findUnique({
      where: { email: playerEmail }
    })

    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      user = await prisma.user.create({
        data: {
          email: playerEmail,
          name: playerName,
          passwordHash: hashedPassword,
          role: 'PLAYER',
          status: 'ACTIVE'
        }
      })
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        tournamentId: id,
        playerName,
        playerEmail,
        playerPhone,
        playerAge: parseInt(playerAge),
        playerGender,
        playerCategory,
        paymentStatus,
        registeredAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Registration created successfully',
      registration 
    })

  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
