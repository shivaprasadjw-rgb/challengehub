import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole, UserStatus, OrganizerStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, address, orgName, docsURL } = await req.json()

    // Validation
    if (!name || !email || !password || !orgName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if organizer with this name already exists
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { slug: orgName.toLowerCase().replace(/\s+/g, '-') }
    })

    if (existingOrganizer) {
      return NextResponse.json(
        { error: 'Organization with this name already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: UserRole.ORG_USER,
        status: UserStatus.PENDING_VERIFICATION
      }
    })

    // Create organizer
    const organizer = await prisma.organizer.create({
      data: {
        name: orgName,
        slug: orgName.toLowerCase().replace(/\s+/g, '-'),
        status: OrganizerStatus.PENDING,
        ownerUserId: user.id,
        contact: {
          email,
          phone: phone || '',
          address: address || ''
        }
      }
    })

    // Create organizer application
    await prisma.organizerApplication.create({
      data: {
        userId: user.id,
        organizerId: organizer.id,
        orgName,
        docsURL: docsURL || null
      }
    })

    // Create user-organizer membership
    await prisma.userOrganizer.create({
      data: {
        userId: user.id,
        organizerId: organizer.id,
        role: 'OWNER'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Organizer application submitted successfully',
      userId: user.id,
      organizerId: organizer.id
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
