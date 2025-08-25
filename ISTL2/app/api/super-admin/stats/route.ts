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

    // Get counts for different organizer statuses
    const [totalOrganizers, pendingApplications, approvedOrganizers] = await Promise.all([
      prisma.organizer.count(),
      prisma.organizerApplication.count({
        where: { status: 'PENDING' }
      }),
      prisma.organizer.count({
        where: { status: 'APPROVED' }
      })
    ])

    // Calculate total revenue from payments
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        type: 'ORGANIZER_REGISTRATION'
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      stats: {
        totalOrganizers,
        pendingApplications,
        approvedOrganizers,
        totalRevenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
