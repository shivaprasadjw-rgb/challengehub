import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSuperAdminAPIs() {
  console.log('🔍 Testing Super Admin API data...')

  try {
    // Check pending applications
    const pendingApplications = await prisma.organizerApplication.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        organizer: {
          select: {
            name: true,
            slug: true,
            status: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    console.log('\n📋 PENDING APPLICATIONS:')
    console.log('========================')
    pendingApplications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.orgName}`)
      console.log(`   User: ${app.user.name} (${app.user.email})`)
      console.log(`   Status: ${app.status}`)
      console.log(`   Submitted: ${app.submittedAt.toISOString()}`)
      console.log(`   Application ID: ${app.id}`)
      console.log('')
    })

    // Check organizer stats
    const [totalOrganizers, pendingApplicationsCount, approvedOrganizers] = await Promise.all([
      prisma.organizer.count(),
      prisma.organizerApplication.count({
        where: { status: 'PENDING' }
      }),
      prisma.organizer.count({
        where: { status: 'APPROVED' }
      })
    ])

    // Calculate total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        type: 'ORGANIZER_REGISTRATION'
      },
      _sum: {
        amount: true
      }
    })

    console.log('📊 SUPER ADMIN STATS:')
    console.log('=====================')
    console.log(`Total Organizers: ${totalOrganizers}`)
    console.log(`Pending Applications: ${pendingApplicationsCount}`)
    console.log(`Approved Organizers: ${approvedOrganizers}`)
    console.log(`Total Revenue: ₹${totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0}`)

    // List all organizers
    const allOrganizers = await prisma.organizer.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n🏢 ALL ORGANIZERS:')
    console.log('==================')
    allOrganizers.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (${org.slug})`)
      console.log(`   Status: ${org.status}`)
      console.log(`   Owner: ${org.owner.name} (${org.owner.email})`)
      console.log(`   Created: ${org.createdAt.toISOString()}`)
      console.log('')
    })

    console.log('\n🎯 NEXT TESTING STEPS:')
    console.log('======================')
    console.log('1. Open http://localhost:3000/super-admin')
    console.log('2. Login with: admin@sportsindia.com / admin123')
    console.log('3. Verify the pending application appears')
    console.log('4. Test the approval process')
    console.log('5. Check organizer dashboard access after approval')

  } catch (error) {
    console.error('❌ Error testing APIs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuperAdminAPIs()
