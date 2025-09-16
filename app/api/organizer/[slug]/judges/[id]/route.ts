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

    // Check if judge exists and belongs to this organizer
    const existingJudge = await prisma.judge.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!existingJudge) {
      return NextResponse.json({ error: 'Judge not found' }, { status: 404 })
    }

    const { name, email, phone, specialties, experience, bio, gender } = await req.json()

    // Validation
    if (!name || !email || !phone || !specialties || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update judge
    const judge = await prisma.judge.update({
      where: { id: params.id },
      data: {
        fullName: name,
        email,
        phone,
        categories: specialties,
        gender,
        bio: bio || null
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'UPDATE_JUDGE',
        entityType: 'JUDGE',
        entityId: judge.id,
        meta: {
          judgeName: judge.fullName,
          email: judge.email,
          categories: judge.categories
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Judge updated successfully',
      judge: {
        id: judge.id,
        fullName: judge.fullName,
        email: judge.email
      }
    })

  } catch (error) {
    console.error('Error updating judge:', error)
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

    // Check if judge exists and belongs to this organizer
    const existingJudge = await prisma.judge.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!existingJudge) {
      return NextResponse.json({ error: 'Judge not found' }, { status: 404 })
    }

    // Check if judge is assigned to any tournaments
    const judgeAssignments = await prisma.judgeAssignment.count({
      where: { judgeId: params.id }
    })

    if (judgeAssignments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete judge as they are assigned to tournaments' },
        { status: 400 }
      )
    }

    // Delete judge
    await prisma.judge.delete({
      where: { id: params.id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'DELETE_JUDGE',
        entityType: 'JUDGE',
        entityId: params.id,
        meta: {
          judgeName: existingJudge.fullName,
          email: existingJudge.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Judge deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
