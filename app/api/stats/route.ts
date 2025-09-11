import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get basic stats
    const [tournamentCount, venueCount, userCount] = await Promise.all([
      prisma.tournament.count(),
      prisma.venue.count(),
      prisma.user.count()
    ])

    return NextResponse.json({
      success: true,
      stats: {
        tournaments: tournamentCount,
        venues: venueCount,
        users: userCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
