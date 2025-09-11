import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id
    const participants = await prisma.registration.findMany({
      where: { tournamentId: tournamentId },
      select: {
        id: true,
        playerName: true,
        playerEmail: true,
        playerCategory: true,
        registeredAt: true,
        paymentStatus: true
      },
      orderBy: { registeredAt: 'asc' }
    })
    return NextResponse.json({ success: true, participants })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
