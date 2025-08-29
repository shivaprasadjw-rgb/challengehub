import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestOrganizer() {
  console.log('🧪 Creating test organizer for end-to-end testing...')

  try {
    // Create test user
    const testPassword = await bcrypt.hash('testpass123', 12)
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: testPassword,
        role: 'ORG_USER',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Test user created:', testUser.email)

    // Create test organizer
    const testOrganizer = await prisma.organizer.create({
      data: {
        name: 'Test Sports Academy',
        slug: 'test-sports-academy',
        status: 'PENDING', // Start as pending for super admin approval
        ownerUserId: testUser.id,
        contact: {
          email: 'test@example.com',
          phone: '+91-9876543210',
          address: 'Test Address, Test City, Test State, India'
        }
      }
    })

    console.log('✅ Test organizer created:', testOrganizer.name)

    // Create organizer application
    const application = await prisma.organizerApplication.create({
      data: {
        userId: testUser.id,
        organizerId: testOrganizer.id,
        orgName: 'Test Sports Academy',
        docsURL: 'https://example.com/test-docs',
        status: 'PENDING'
      }
    })

    console.log('✅ Test application created:', application.id)

    // Create user-organizer membership
    await prisma.userOrganizer.create({
      data: {
        userId: testUser.id,
        organizerId: testOrganizer.id,
        role: 'OWNER'
      }
    })

    console.log('✅ Test membership created')

    console.log('\n🎯 TEST DATA SUMMARY:')
    console.log('======================')
    console.log(`User Email: ${testUser.email}`)
    console.log(`Password: testpass123`)
    console.log(`Organizer Name: ${testOrganizer.name}`)
    console.log(`Organizer Slug: ${testOrganizer.slug}`)
    console.log(`Application ID: ${application.id}`)
    console.log(`Status: ${testOrganizer.status} (PENDING for super admin approval)`)
    console.log('\nNext steps:')
    console.log('1. Login as super admin at http://localhost:3000/super-admin')
    console.log('2. Check pending applications')
    console.log('3. Approve the test organizer')
    console.log('4. Test organizer dashboard access')

  } catch (error) {
    console.error('❌ Error creating test organizer:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrganizer()
