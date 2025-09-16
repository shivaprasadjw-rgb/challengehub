import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [totalUsers, totalOrganizers, totalTournaments, pendingApplications] = await Promise.all([
      prisma.user.count(),
      prisma.organizer.count(),
      prisma.tournament.count(),
      prisma.organizerApplication.count({
        where: { status: 'PENDING' }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalTournaments,
        pendingApplications
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
