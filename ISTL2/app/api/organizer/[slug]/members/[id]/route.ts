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

    const { role } = await req.json()

    // Validation
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

    // Check if membership exists
    const existingMembership = await prisma.userOrganizer.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
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

    if (!existingMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Update membership role
    const updatedMembership = await prisma.userOrganizer.update({
      where: { id: params.id },
      data: { role: role as any },
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
        action: 'UPDATE_ORGANIZER_MEMBER_ROLE',
        entityType: 'UserOrganizer',
        entityId: params.id,
        meta: {
          memberEmail: existingMembership.user.email,
          memberName: existingMembership.user.name,
          oldRole: existingMembership.role,
          newRole: role,
          updatedBy: session.user.name || session.user.email
        }
      }
    })

    return NextResponse.json({
      message: 'Member role updated successfully',
      member: {
        id: updatedMembership.id,
        userId: updatedMembership.user.id,
        name: updatedMembership.user.name,
        email: updatedMembership.user.email,
        userRole: updatedMembership.user.role,
        organizerRole: updatedMembership.role,
        status: updatedMembership.user.status,
        joinedAt: updatedMembership.createdAt
      }
    })

  } catch (error) {
    console.error('Error updating member role:', error)
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

    // Check if membership exists
    const existingMembership = await prisma.userOrganizer.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Prevent removing the owner
    if (existingMembership.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove organizer owner' }, { status: 400 })
    }

    // Delete membership
    await prisma.userOrganizer.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: organizer.id,
        action: 'REMOVE_ORGANIZER_MEMBER',
        entityType: 'UserOrganizer',
        entityId: params.id,
        meta: {
          memberEmail: existingMembership.user.email,
          memberName: existingMembership.user.name,
          role: existingMembership.role,
          removedBy: session.user.name || session.user.email
        }
      }
    })

    return NextResponse.json({
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
