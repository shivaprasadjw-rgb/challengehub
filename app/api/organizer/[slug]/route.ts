import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(
      (org: any) => org.slug === params.slug
    );

    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      organizer
    });
  } catch (error) {
    console.error('Error fetching organizer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
