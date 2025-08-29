import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestOrganizerData() {
  console.log('🏗️ Creating sample data for Test Sports Academy...')

  try {
    // Get the test organizer
    const testOrganizer = await prisma.organizer.findUnique({
      where: { slug: 'test-sports-academy' },
      include: { owner: true }
    })

    if (!testOrganizer) {
      console.log('❌ Test organizer not found')
      return
    }

    if (testOrganizer.status !== 'APPROVED') {
      console.log('❌ Test organizer is not approved yet. Run approval script first.')
      return
    }

    console.log(`✅ Found approved organizer: ${testOrganizer.name}`)

    // Create a test venue
    const venue = await prisma.venue.create({
      data: {
        organizerId: testOrganizer.id,
        name: 'Test Sports Complex',
        locality: 'Central Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        address: '123 Test Street, Test Area, Test City, Test State - 123456'
      }
    })

    console.log(`✅ Created venue: ${venue.name}`)

    // Create test judges
    const judges = await Promise.all([
      prisma.judge.create({
        data: {
          organizerId: testOrganizer.id,
          fullName: 'Judge Alice Smith',
          email: 'alice@testjudge.com',
          phone: '+91-9876543210',
          categories: ['Badminton', 'Tennis'],
          gender: 'FEMALE',
          bio: 'Experienced sports judge with 10+ years in racquet sports'
        }
      }),
      prisma.judge.create({
        data: {
          organizerId: testOrganizer.id,
          fullName: 'Judge Bob Johnson',
          email: 'bob@testjudge.com',
          phone: '+91-9876543211',
          categories: ['Basketball', 'Volleyball'],
          gender: 'MALE',
          bio: 'Professional referee specializing in team sports'
        }
      })
    ])

    console.log(`✅ Created ${judges.length} judges`)

    // Create a test tournament
    const tournament = await prisma.tournament.create({
      data: {
        organizerId: testOrganizer.id,
        title: 'Test Academy Championship 2024',
        sport: 'Badminton',
        date: new Date('2024-12-15'),
        entryFee: 500.00,
        maxParticipants: 16,
        status: 'ACTIVE',
        venueId: venue.id
      }
    })

    console.log(`✅ Created tournament: ${tournament.title}`)

    // Create test players (users) and registrations
    const players = [
      { name: 'Player One', email: 'player1@test.com', category: 'BEGINNER', age: 25, gender: 'MALE' },
      { name: 'Player Two', email: 'player2@test.com', category: 'INTERMEDIATE', age: 28, gender: 'FEMALE' },
      { name: 'Player Three', email: 'player3@test.com', category: 'ADVANCED', age: 30, gender: 'MALE' },
      { name: 'Player Four', email: 'player4@test.com', category: 'BEGINNER', age: 22, gender: 'FEMALE' },
      { name: 'Player Five', email: 'player5@test.com', category: 'INTERMEDIATE', age: 27, gender: 'MALE' },
      { name: 'Player Six', email: 'player6@test.com', category: 'ADVANCED', age: 32, gender: 'FEMALE' }
    ]

    for (const playerData of players) {
      // Create or get user
      let user = await prisma.user.findUnique({
        where: { email: playerData.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: playerData.email,
            name: playerData.name,
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        })
      }

      // Create registration
      await prisma.registration.create({
        data: {
          tournamentId: tournament.id,
          playerName: playerData.name,
          playerEmail: playerData.email,
          playerPhone: '+91-9876543210',
          playerAge: playerData.age,
          playerGender: playerData.gender,
          playerCategory: playerData.category,
          paymentStatus: 'SUCCEEDED',
          registeredAt: new Date()
        }
      })
    }

    console.log(`✅ Created ${players.length} player registrations`)

    // Create judge assignments
    await Promise.all([
      prisma.judgeAssignment.create({
        data: {
          tournamentId: tournament.id,
          judgeId: judges[0].id,
          role: 'HEAD_JUDGE'
        }
      }),
      prisma.judgeAssignment.create({
        data: {
          tournamentId: tournament.id,
          judgeId: judges[1].id,
          role: 'LINE_JUDGE'
        }
      })
    ])

    console.log('✅ Created judge assignments')

    // Create audit logs
    await prisma.auditLog.create({
      data: {
        actorUserId: testOrganizer.owner.id,
        organizerId: testOrganizer.id,
        action: 'CREATE_TOURNAMENT',
        entityType: 'TOURNAMENT',
        entityId: tournament.id,
        meta: {
          tournamentTitle: tournament.title,
          sport: tournament.sport
        }
      }
    })

    console.log('✅ Created audit logs')

    // Get final stats
    const stats = await getOrganizerStats(testOrganizer.slug)

    console.log('\n🎯 TEST ORGANIZER READY!')
    console.log('========================')
    console.log(`Organizer: ${testOrganizer.name}`)
    console.log(`Status: ${testOrganizer.status}`)
    console.log(`Total Tournaments: ${stats.totalTournaments}`)
    console.log(`Total Venues: ${stats.totalVenues}`)
    console.log(`Total Judges: ${stats.totalJudges}`)
    console.log(`Total Registrations: ${stats.totalRegistrations}`)

    console.log('\n🚀 READY FOR TESTING:')
    console.log('======================')
    console.log(`Login URL: http://localhost:3000/auth/login`)
    console.log(`Email: test@example.com`)
    console.log(`Password: testpass123`)
    console.log(`Dashboard: http://localhost:3000/organizer/test-sports-academy/dashboard`)
    console.log(`Tournament: http://localhost:3000/organizer/test-sports-academy/tournaments/${tournament.id}`)

    console.log('\n✅ Features to test:')
    console.log('- Dashboard overview')
    console.log('- Tournament management')
    console.log('- Judge management')
    console.log('- Venue management')
    console.log('- Member management')
    console.log('- Tournament progression')
    console.log('- Bulk registration')

  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function getOrganizerStats(slug: string) {
  const organizer = await prisma.organizer.findUnique({
    where: { slug }
  })

  if (!organizer) return { totalTournaments: 0, totalVenues: 0, totalJudges: 0, totalRegistrations: 0 }

  const [totalTournaments, totalVenues, totalJudges, totalRegistrations] = await Promise.all([
    prisma.tournament.count({ where: { organizerId: organizer.id } }),
    prisma.venue.count({ where: { organizerId: organizer.id } }),
    prisma.judge.count({ where: { organizerId: organizer.id } }),
    prisma.registration.count({ where: { tournament: { organizerId: organizer.id } } })
  ])

  return { totalTournaments, totalVenues, totalJudges, totalRegistrations }
}

createTestOrganizerData()
