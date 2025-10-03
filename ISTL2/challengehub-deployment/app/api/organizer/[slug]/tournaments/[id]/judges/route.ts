import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Get all judges assigned to a tournament
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

    // Get tournament with judge assignments
    const tournament = await prisma.tournament.findFirst({
      where: { 
        id: params.id,
        organizer: { slug: params.slug }
      },
      include: {
        judges: {
          include: {
            judge: {
              select: {
                id: true,
                fullName: true,
                email: true,
                categories: true,
                gender: true
              }
            }
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({
      assignments: tournament.judges.map(assignment => ({
        id: assignment.id,
        role: assignment.role,
        assignedAt: assignment.assignedAt,
        judge: assignment.judge
      }))
    })

  } catch (error) {
    console.error('Error fetching tournament judges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Assign a judge to a tournament
export async function POST(
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

    const { judgeId, role = 'JUDGE' } = await req.json()

    if (!judgeId) {
      return NextResponse.json(
        { error: 'Judge ID is required' },
        { status: 400 }
      )
    }

    // Verify tournament exists and belongs to organizer
    const tournament = await prisma.tournament.findFirst({
      where: { 
        id: params.id,
        organizer: { slug: params.slug }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Verify judge exists and belongs to organizer
    const judge = await prisma.judge.findFirst({
      where: { 
        id: judgeId,
        organizer: { slug: params.slug }
      }
    })

    if (!judge) {
      return NextResponse.json({ error: 'Judge not found' }, { status: 404 })
    }

    // Check if judge is already assigned to this tournament
    const existingAssignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId,
        tournamentId: params.id
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Judge is already assigned to this tournament' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await prisma.judgeAssignment.create({
      data: {
        judgeId,
        tournamentId: params.id,
        role
      },
      include: {
        judge: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: tournament.organizerId,
        tournamentId: tournament.id,
        action: 'ASSIGN_JUDGE',
        entityType: 'JUDGE_ASSIGNMENT',
        entityId: assignment.id,
        meta: {
          judgeName: assignment.judge.fullName,
          judgeEmail: assignment.judge.email,
          role: assignment.role,
          tournamentTitle: tournament.title
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Judge assigned successfully',
      assignment: {
        id: assignment.id,
        role: assignment.role,
        assignedAt: assignment.assignedAt,
        judge: assignment.judge
      }
    })

  } catch (error) {
    console.error('Error assigning judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove a judge from a tournament
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

    const { searchParams } = new URL(req.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Get assignment with judge and tournament info
    const assignment = await prisma.judgeAssignment.findFirst({
      where: { id: assignmentId },
      include: {
        judge: true,
        tournament: {
          include: {
            organizer: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify organizer access
    if (assignment.tournament.organizer.slug !== params.slug) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete assignment
    await prisma.judgeAssignment.delete({
      where: { id: assignmentId }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: assignment.tournament.organizerId,
        tournamentId: assignment.tournament.id,
        action: 'REMOVE_JUDGE',
        entityType: 'JUDGE_ASSIGNMENT',
        entityId: assignmentId,
        meta: {
          judgeName: assignment.judge.fullName,
          judgeEmail: assignment.judge.email,
          role: assignment.role,
          tournamentTitle: assignment.tournament.title
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Judge removed successfully'
    })

  } catch (error) {
    console.error('Error removing judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
