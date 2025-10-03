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

  // Create venues for different cities
  const venues = [
    {
      id: 'mumbai-venue',
      name: 'Sports India Arena',
      locality: 'Central Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      address: '123 Sports Street, Central Mumbai, Maharashtra 400001'
    },
    {
      id: 'delhi-venue',
      name: 'Delhi Sports Complex',
      locality: 'Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      address: '456 Sports Avenue, Connaught Place, Delhi 110001'
    },
    {
      id: 'bangalore-venue',
      name: 'Bangalore Badminton Center',
      locality: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      address: '789 Sports Road, Koramangala, Bangalore 560034'
    },
    {
      id: 'chennai-venue',
      name: 'Chennai Sports Hub',
      locality: 'Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      address: '321 Sports Lane, Anna Nagar, Chennai 600040'
    },
    {
      id: 'kolkata-venue',
      name: 'Kolkata Sports Center',
      locality: 'Salt Lake',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700064',
      address: '654 Sports Boulevard, Salt Lake, Kolkata 700064'
    }
  ]

  const createdVenues = []
  for (const venueData of venues) {
    const venue = await prisma.venue.upsert({
      where: { id: venueData.id },
      update: {},
      create: {
        ...venueData,
        organizerId: defaultOrganizer.id
      }
    })
    createdVenues.push(venue)
  }

  console.log('✅ Venues created for all cities')

  // Create sample tournaments
  const sampleTournaments = [
    {
      title: 'Mumbai Badminton Championship 2024',
      sport: 'Badminton',
      date: new Date('2024-12-15'),
      entryFee: 500,
      maxParticipants: 32,
      status: 'ACTIVE' as const,
      venueId: 'mumbai-venue'
    },
    {
      title: 'Delhi Open Badminton Tournament',
      sport: 'Badminton',
      date: new Date('2024-12-20'),
      entryFee: 750,
      maxParticipants: 64,
      status: 'ACTIVE' as const,
      venueId: 'delhi-venue'
    },
    {
      title: 'Bangalore Badminton Masters',
      sport: 'Badminton',
      date: new Date('2024-11-30'),
      entryFee: 600,
      maxParticipants: 32,
      status: 'COMPLETED' as const,
      venueId: 'bangalore-venue'
    },
    {
      title: 'Chennai Badminton League',
      sport: 'Badminton',
      date: new Date('2024-12-25'),
      entryFee: 400,
      maxParticipants: 48,
      status: 'ACTIVE' as const,
      venueId: 'chennai-venue'
    },
    {
      title: 'Kolkata Badminton Championship',
      sport: 'Badminton',
      date: new Date('2024-12-10'),
      entryFee: 550,
      maxParticipants: 32,
      status: 'ACTIVE' as const,
      venueId: 'kolkata-venue'
    }
  ]

  for (const tournamentData of sampleTournaments) {
    const existingTournament = await prisma.tournament.findFirst({
      where: {
        title: tournamentData.title,
        organizerId: defaultOrganizer.id
      }
    })

    if (!existingTournament) {
      await prisma.tournament.create({
        data: {
          ...tournamentData,
          organizerId: defaultOrganizer.id
        }
      })
    }
  }

  console.log('✅ Sample tournaments created')

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
