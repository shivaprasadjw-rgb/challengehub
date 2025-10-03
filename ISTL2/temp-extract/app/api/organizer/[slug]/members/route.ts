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

    // Get organizer members
    const members = await prisma.userOrganizer.findMany({
      where: { organizerId: organizer.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json({
      members: members.map(member => ({
        id: member.userId,
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        userRole: member.user.role,
        organizerRole: member.role,
        status: member.user.status,
        joinedAt: member.joinedAt,
        lastActive: member.user.createdAt // You can add lastActiveAt field to track this
      }))
    })

  } catch (error) {
    console.error('Error fetching organizer members:', error)
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

    const { email, role = 'MEMBER' } = await req.json()

    // Validation
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const validRoles = ['OWNER', 'ADMIN', 'STAFF', 'MEMBER']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMembership = await prisma.userOrganizer.findUnique({
      where: {
        userId_organizerId: {
          userId: user.id,
          organizerId: organizer.id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    // Create membership
    const membership = await prisma.userOrganizer.create({
      data: {
        userId: user.id,
        organizerId: organizer.id,
        role: role as any
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: organizer.id,
        action: 'ADD_ORGANIZER_MEMBER',
        entityType: 'UserOrganizer',
        entityId: membership.userId,
        meta: {
          memberEmail: user.email,
          memberName: user.name,
          role: role,
          addedBy: session.user.name || session.user.email
        }
      }
    })

    return NextResponse.json({
      message: 'Member added successfully',
      member: {
        id: membership.userId,
        userId: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        userRole: membership.user.role,
        organizerRole: membership.role,
        status: membership.user.status,
        joinedAt: membership.joinedAt
      }
    })

  } catch (error) {
    console.error('Error adding organizer member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
