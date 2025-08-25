import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Super Admin user
  const superAdminPassword = await bcrypt.hash('admin123', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sportsindia.com' },
    update: {},
    create: {
      email: 'admin@sportsindia.com',
      name: 'Super Admin',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  })

  console.log('✅ Super Admin created:', superAdmin.email)

  // Create default organizer (Sports India)
  const defaultOrganizer = await prisma.organizer.upsert({
    where: { slug: 'sports-india' },
    update: {},
    create: {
      name: 'Sports India',
      slug: 'sports-india',
      status: 'APPROVED',
      ownerUserId: superAdmin.id,
      contact: {
        email: 'admin@sportsindia.com',
        phone: '+91-1234567890',
        address: 'Mumbai, Maharashtra, India'
      },
      oneTimeFeePaidAt: new Date()
    }
  })

  console.log('✅ Default organizer created:', defaultOrganizer.name)

  // Create membership for Super Admin
  await prisma.userOrganizer.upsert({
    where: {
      userId_organizerId: {
        userId: superAdmin.id,
        organizerId: defaultOrganizer.id
      }
    },
    update: {},
    create: {
      userId: superAdmin.id,
      organizerId: defaultOrganizer.id,
      role: 'OWNER'
    }
  })

  console.log('✅ Super Admin membership created')

  // Create default venue
  const defaultVenue = await prisma.venue.upsert({
    where: { id: 'default-venue' },
    update: {},
    create: {
      id: 'default-venue',
      organizerId: defaultOrganizer.id,
      name: 'Sports India Arena',
      locality: 'Central Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      address: '123 Sports Street, Central Mumbai, Maharashtra 400001'
    }
  })

  console.log('✅ Default venue created:', defaultVenue.name)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
