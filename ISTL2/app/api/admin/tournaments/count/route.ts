import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count total tournaments
    const count = await prisma.tournament.count();

    return NextResponse.json({ 
      count,
      _deprecated: {
        message: 'This endpoint is deprecated. Use /api/super-admin/analytics/stats instead',
        newEndpoint: '/api/super-admin/analytics/stats'
      }
    });
  } catch (error) {
    console.error('Error counting tournaments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
