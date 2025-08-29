import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get comprehensive platform statistics
    const [
      totalTournaments,
      activeTournaments,
      completedTournaments,
      totalVenues,
      totalRegistrations,
      totalOrganizers,
      approvedOrganizers,
      totalRevenue
    ] = await Promise.all([
      prisma.tournament.count(),
      prisma.tournament.count({ where: { status: 'ACTIVE' } }),
      prisma.tournament.count({ where: { status: 'COMPLETED' } }),
      prisma.venue.count(),
      prisma.registration.count(),
      prisma.organizer.count(),
      prisma.organizer.count({ where: { status: 'APPROVED' } }),
      prisma.registration.aggregate({
        where: {
          paymentStatus: 'SUCCEEDED',
          tournament: {
            entryFee: { gt: 0 }
          }
        },
        _sum: {
          tournament: {
            select: {
              entryFee: true
            }
          }
        }
      })
    ])

    // Calculate total revenue from entry fees
    const revenueFromEntryFees = await prisma.tournament.aggregate({
      where: {
        registrations: {
          some: {
            paymentStatus: 'SUCCEEDED'
          }
        }
      },
      _sum: {
        entryFee: true
      }
    })

    return NextResponse.json({
      stats: {
        totalTournaments,
        activeTournaments,
        completedTournaments,
        totalVenues,
        totalRegistrations,
        totalOrganizers,
        approvedOrganizers,
        totalRevenue: revenueFromEntryFees._sum.entryFee ? Number(revenueFromEntryFees._sum.entryFee) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching analytics stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
