import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testApprovalProcess() {
  console.log('🧪 Testing organizer approval process...')

  try {
    // Get the test application
    const pendingApp = await prisma.organizerApplication.findFirst({
      where: {
        orgName: 'Test Sports Academy',
        status: 'PENDING'
      },
      include: {
        user: true,
        organizer: true
      }
    })

    if (!pendingApp) {
      console.log('❌ No pending test application found')
      return
    }

    console.log(`📄 Found application: ${pendingApp.id}`)
    console.log(`🏢 Organizer: ${pendingApp.orgName}`)
    console.log(`👤 User: ${pendingApp.user.name} (${pendingApp.user.email})`)
    console.log(`📅 Status: ${pendingApp.status}`)

    // Get super admin user
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'admin@sportsindia.com' }
    })

    if (!superAdmin) {
      console.log('❌ Super admin not found')
      return
    }

    // Simulate approval process
    console.log('\n🎯 Simulating approval process...')
    
    // Update application to approved
    await prisma.organizerApplication.update({
      where: { id: pendingApp.id },
      data: {
        status: 'APPROVED',
        decidedAt: new Date(),
        decidedBy: superAdmin.id
      }
    })

    // Update organizer status to approved
    await prisma.organizer.update({
      where: { id: pendingApp.organizerId },
      data: {
        status: 'APPROVED'
      }
    })

    // Update user status to active
    await prisma.user.update({
      where: { id: pendingApp.userId },
      data: {
        status: 'ACTIVE'
      }
    })

    console.log('✅ Approval process completed!')

    // Verify the changes
    const updatedOrganizer = await prisma.organizer.findUnique({
      where: { id: pendingApp.organizerId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            status: true
          }
        }
      }
    })

    const updatedApplication = await prisma.organizerApplication.findUnique({
      where: { id: pendingApp.id }
    })

    console.log('\n✅ VERIFICATION RESULTS:')
    console.log('========================')
    console.log(`Organizer Status: ${updatedOrganizer?.status}`)
    console.log(`User Status: ${updatedOrganizer?.owner.status}`)
    console.log(`Application Status: ${updatedApplication?.status}`)
    console.log(`Decision Date: ${updatedApplication?.decidedAt}`)

    console.log('\n🎯 NOW TEST ORGANIZER DASHBOARD ACCESS:')
    console.log('=======================================')
    console.log(`Login URL: http://localhost:3000/auth/login`)
    console.log(`Email: ${pendingApp.user.email}`)
    console.log(`Password: testpass123`)
    console.log(`Dashboard URL: http://localhost:3000/organizer/${updatedOrganizer?.slug}/dashboard`)

    // Get organizer stats to test dashboard functionality
    const stats = await getOrganizerStats(updatedOrganizer?.slug || '')
    console.log('\n📊 ORGANIZER DASHBOARD STATS:')
    console.log('=============================')
    console.log(`Total Tournaments: ${stats.totalTournaments}`)
    console.log(`Active Tournaments: ${stats.activeTournaments}`)
    console.log(`Total Venues: ${stats.totalVenues}`)
    console.log(`Total Judges: ${stats.totalJudges}`)
    console.log(`Total Registrations: ${stats.totalRegistrations}`)

  } catch (error) {
    console.error('❌ Error testing approval process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function getOrganizerStats(slug: string) {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { slug }
    })

    if (!organizer) {
      throw new Error('Organizer not found')
    }

    const [totalTournaments, activeTournaments, totalVenues, totalJudges, totalRegistrations] = await Promise.all([
      prisma.tournament.count({
        where: { organizerId: organizer.id }
      }),
      prisma.tournament.count({
        where: {
          organizerId: organizer.id,
          status: 'ACTIVE'
        }
      }),
      prisma.venue.count({
        where: { organizerId: organizer.id }
      }),
      prisma.judge.count({
        where: { organizerId: organizer.id }
      }),
      prisma.registration.count({
        where: {
          tournament: {
            organizerId: organizer.id
          }
        }
      })
    ])

    return {
      totalTournaments,
      activeTournaments,
      totalVenues,
      totalJudges,
      totalRegistrations
    }
  } catch (error) {
    console.error('Error fetching organizer stats:', error)
    return {
      totalTournaments: 0,
      activeTournaments: 0,
      totalVenues: 0,
      totalJudges: 0,
      totalRegistrations: 0
    }
  }
}

testApprovalProcess()
