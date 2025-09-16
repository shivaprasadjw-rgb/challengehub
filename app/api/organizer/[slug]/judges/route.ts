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

    // Get judges
    const judges = await prisma.judge.findMany({
      where: { organizerId: organizer.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        categories: true,
        gender: true,
        bio: true,
        createdAt: true
      },
      orderBy: {
        fullName: 'asc'
      }
    })

    return NextResponse.json({
      judges
    })

  } catch (error) {
    console.error('Error fetching organizer judges:', error)
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

    const { name, email, phone, specialties, experience, bio, gender } = await req.json()

    // Validation
    if (!name || !email || !phone || !specialties || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create judge
    const judge = await prisma.judge.create({
      data: {
        fullName: name,
        email,
        phone,
        categories: specialties,
        gender,
        bio: bio || null,
        organizerId: organizer.id
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        organizerId: organizer.id,
        action: 'CREATE_JUDGE',
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
      message: 'Judge created successfully',
      judge: {
        id: judge.id,
        fullName: judge.fullName,
        email: judge.email
      }
    })

  } catch (error) {
    console.error('Error creating judge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
