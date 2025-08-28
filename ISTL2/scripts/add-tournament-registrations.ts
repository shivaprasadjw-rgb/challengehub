import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTournamentRegistrations() {
  const tournamentId = 'cmeuwctui00016u6a9zjvtsbh'
  
  const newRegistrations = [
    {
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+91-9876543210',
      age: 28,
      gender: 'MALE' as const,
      category: "Men's Singles"
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com', 
      phone: '+91-9876543211',
      age: 24,
      gender: 'FEMALE' as const,
      category: "Women's Singles"
    },
    {
      name: 'James Rodriguez',
      email: 'james.rodriguez@example.com',
      phone: '+91-9876543212', 
      age: 31,
      gender: 'MALE' as const,
      category: "Men's Singles"
    },
    {
      name: 'Lisa Wang',
      email: 'lisa.wang@example.com',
      phone: '+91-9876543213',
      age: 26,
      gender: 'FEMALE' as const,
      category: "Women's Singles"
    },
    {
      name: 'Robert Kim',
      email: 'robert.kim@example.com',
      phone: '+91-9876543214',
      age: 35,
      gender: 'MALE' as const,
      category: "Men's Singles"
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+91-9876543215',
      age: 22,
      gender: 'FEMALE' as const,
      category: "Women's Singles"
    },
    {
      name: 'Alex Thompson',
      email: 'alex.thompson@example.com',
      phone: '+91-9876543216',
      age: 29,
      gender: 'MALE' as const,
      category: "Men's Singles"
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+91-9876543217',
      age: 27,
      gender: 'FEMALE' as const,
      category: "Women's Singles"
    }
  ]

  console.log('Adding 8 new registrations to tournament...')
  
  for (const registration of newRegistrations) {
    try {
      // Create or get user first
      let user = await prisma.user.findUnique({
        where: { email: registration.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: registration.email,
            name: registration.name,
            role: 'PLAYER'
          }
        })
        console.log(`✓ Created user: ${registration.name}`)
      } else {
        console.log(`✓ Found existing user: ${registration.name}`)
      }

      // Check if already registered
      const existingRegistration = await prisma.registration.findFirst({
        where: {
          tournamentId,
          playerEmail: registration.email
        }
      })

      if (existingRegistration) {
        console.log(`⚠ ${registration.name} is already registered, skipping...`)
        continue
      }

      // Create registration
      await prisma.registration.create({
        data: {
          tournamentId,
          playerName: registration.name,
          playerEmail: registration.email,
          playerPhone: registration.phone,
          playerAge: registration.age,
          playerGender: registration.gender,
          playerCategory: registration.category,
          paymentStatus: 'SUCCEEDED'
        }
      })

      console.log(`✓ Registered: ${registration.name} for ${registration.category}`)

    } catch (error) {
      console.error(`✗ Error registering ${registration.name}:`, error)
    }
  }

  // Get final count
  const totalRegistrations = await prisma.registration.count({
    where: { tournamentId }
  })

  console.log(`\n🎾 Tournament now has ${totalRegistrations} total registrations!`)
  console.log('Ready for Tournament Progression testing! 🚀')
  
  await prisma.$disconnect()
}

addTournamentRegistrations().catch(console.error)
