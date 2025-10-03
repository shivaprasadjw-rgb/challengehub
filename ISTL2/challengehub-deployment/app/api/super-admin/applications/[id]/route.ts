import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApplicationStatus, OrganizerStatus, UserStatus } from '@prisma/client'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await req.json()
    
    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    const application = await prisma.organizerApplication.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        organizer: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      )
    }

    // Update application status
    await prisma.organizerApplication.update({
      where: { id: params.id },
      data: {
        status: action === 'APPROVE' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
        decidedAt: new Date(),
        decidedBy: session.user.id
      }
    })

    if (action === 'APPROVE') {
      // Update organizer status
      await prisma.organizer.update({
        where: { id: application.organizerId },
        data: {
          status: OrganizerStatus.APPROVED
        }
      })

      // Update user status
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          status: UserStatus.ACTIVE
        }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: session.user.id,
          organizerId: application.organizerId,
          action: 'APPROVE_ORGANIZER',
          entityType: 'ORGANIZER_APPLICATION',
          entityId: application.id,
          meta: {
            organizerName: application.orgName,
            userEmail: application.user.email
          }
        }
      })
    } else {
      // For rejected applications, update user status to inactive
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          status: UserStatus.INACTIVE
        }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: session.user.id,
          organizerId: application.organizerId,
          action: 'REJECT_ORGANIZER',
          entityType: 'ORGANIZER_APPLICATION',
          entityId: application.id,
          meta: {
            organizerName: application.orgName,
            userEmail: application.user.email
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Application ${action.toLowerCase()}d successfully`
    })

  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
