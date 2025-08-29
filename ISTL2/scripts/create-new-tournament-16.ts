import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createNewTournament16() {
  console.log('🏆 Creating new tournament with 16 participants...')

  try {
    // Step 1: Create a new venue
    const venue = await prisma.venue.create({
      data: {
        name: 'New Sports Complex 2024',
        address: '123 New Sports Street',
        locality: 'Central Area',
        city: 'New City',
        state: 'New State',
        pincode: '123456',
        organizerId: 'cmesxo7e70002b96bitbm0x22'
      }
    })
    console.log('✅ Created venue:', venue.name)

    // Step 2: Create a new tournament
    const tournament = await prisma.tournament.create({
      data: {
        title: 'New Championship 2024',
        sport: 'Badminton',
        date: new Date('2024-12-20'),
        entryFee: 750.00,
        maxParticipants: 16,
        status: 'ACTIVE',
        currentRound: 'Registration Open',
        venueId: venue.id,
        organizerId: 'cmesxo7e70002b96bitbm0x22' // Using existing organizer
      }
    })
    console.log('✅ Created tournament:', tournament.title)

    // Step 3: Create 16 participants with real names
    const participants = [
      { name: 'Aarav Sharma', email: 'aarav.sharma@email.com', phone: '+91-9000000001', skill: 'ADVANCED', age: 25, gender: 'MALE', category: 'SINGLES' },
      { name: 'Zara Khan', email: 'zara.khan@email.com', phone: '+91-9000000002', skill: 'INTERMEDIATE', age: 23, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Reyansh Patel', email: 'reyansh.patel@email.com', phone: '+91-9000000003', skill: 'ADVANCED', age: 27, gender: 'MALE', category: 'SINGLES' },
      { name: 'Ananya Singh', email: 'ananya.singh@email.com', phone: '+91-9000000004', skill: 'BEGINNER', age: 20, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Vihaan Mehta', email: 'vihaan.mehta@email.com', phone: '+91-9000000005', skill: 'INTERMEDIATE', age: 24, gender: 'MALE', category: 'SINGLES' },
      { name: 'Kiara Joshi', email: 'kiara.joshi@email.com', phone: '+91-9000000006', skill: 'ADVANCED', age: 26, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Arjun Verma', email: 'arjun.verma@email.com', phone: '+91-9000000007', skill: 'BEGINNER', age: 21, gender: 'MALE', category: 'SINGLES' },
      { name: 'Myra Kapoor', email: 'myra.kapoor@email.com', phone: '+91-9000000008', skill: 'INTERMEDIATE', age: 22, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Dhruv Iyer', email: 'dhruv.iyer@email.com', phone: '+91-9000000009', skill: 'ADVANCED', age: 28, gender: 'MALE', category: 'SINGLES' },
      { name: 'Avni Rao', email: 'avni.rao@email.com', phone: '+91-9000000010', skill: 'BEGINNER', age: 19, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Krish Bansal', email: 'krish.bansal@email.com', phone: '+91-9000000011', skill: 'INTERMEDIATE', age: 25, gender: 'MALE', category: 'SINGLES' },
      { name: 'Riya Agarwal', email: 'riya.agarwal@email.com', phone: '+91-9000000012', skill: 'ADVANCED', age: 24, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Shaurya Kumar', email: 'shaurya.kumar@email.com', phone: '+91-9000000013', skill: 'BEGINNER', age: 20, gender: 'MALE', category: 'SINGLES' },
      { name: 'Ishita Nair', email: 'ishita.nair@email.com', phone: '+91-9000000014', skill: 'INTERMEDIATE', age: 23, gender: 'FEMALE', category: 'SINGLES' },
      { name: 'Advait Gupta', email: 'advait.gupta@email.com', phone: '+91-9000000015', skill: 'ADVANCED', age: 26, gender: 'MALE', category: 'SINGLES' },
      { name: 'Navya Reddy', email: 'navya.reddy@email.com', phone: '+91-9000000016', skill: 'BEGINNER', age: 21, gender: 'FEMALE', category: 'SINGLES' }
    ]

    console.log('\n🎯 Creating 16 participant registrations...')
    const registrations = []
    
    for (const participant of participants) {
      // First create user if doesn't exist
      let user = await prisma.user.findUnique({
        where: { email: participant.email }
      })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: participant.email,
            name: participant.name,
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        })
      }
      
      const registration = await prisma.registration.create({
        data: {
          tournamentId: tournament.id,
          playerName: participant.name,
          playerEmail: participant.email,
          playerPhone: participant.phone,
          playerAge: participant.age,
          playerGender: participant.gender,
          playerCategory: participant.category,
          paymentStatus: 'SUCCEEDED'
        }
      })
      registrations.push(registration)
      console.log(`  ✅ ${participant.name} (${participant.skill})`)
    }

    console.log(`\n✅ Created ${registrations.length} registrations`)

    // Step 4: Initialize tournament progression
    console.log('\n🎯 Initializing tournament progression...')
    
    // Create rounds for 16 participants
    const rounds = [
      { name: 'Round of 16', order: 1, maxMatches: 8 },
      { name: 'Quarterfinal', order: 2, maxMatches: 4 },
      { name: 'Semifinal', order: 3, maxMatches: 2 },
      { name: 'Final', order: 4, maxMatches: 1 },
      { name: '3rd Place Match', order: 5, maxMatches: 1 }
    ]

    const createdRounds = []
    for (const roundData of rounds) {
      const round = await prisma.tournamentRound.create({
        data: {
          tournamentId: tournament.id,
          name: roundData.name,
          order: roundData.order,
          maxMatches: roundData.maxMatches,
          isCompleted: false
        }
      })
      createdRounds.push(round)
      console.log(`  ✅ Created round: ${round.name}`)
    }

    // Step 5: Generate Round of 16 matches
    console.log('\n🎯 Generating Round of 16 matches...')
    
    const round16 = createdRounds.find(r => r.name === 'Round of 16')
    if (round16) {
      const round16Matches = []
      
      for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
          const matchNumber = Math.floor(i / 2) + 1
          round16Matches.push({
            tournamentId: tournament.id,
            roundId: round16.id,
            matchCode: `R16-M${matchNumber.toString().padStart(2, '0')}`,
            player1: participants[i].name,
            player2: participants[i + 1].name,
            isCompleted: false
          })
        }
      }
      
      if (round16Matches.length > 0) {
        await prisma.match.createMany({
          data: round16Matches
        })
        console.log(`✅ Created ${round16Matches.length} Round of 16 matches`)
      }
    }

    // Step 6: Update tournament status
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentRound: 'Round of 16',
        status: 'ACTIVE'
      }
    })

    console.log('\n🏆 NEW TOURNAMENT CREATED SUCCESSFULLY!')
    console.log('=========================================')
    console.log(`Tournament: ${tournament.title}`)
    console.log(`Venue: ${venue.name}`)
    console.log(`Participants: ${registrations.length}/16`)
    console.log(`Current Round: Round of 16`)
    console.log(`Status: ACTIVE`)
    console.log('\n🎯 Ready for tournament progression testing!')
    console.log(`Tournament ID: ${tournament.id}`)

  } catch (error) {
    console.error('❌ Error creating new tournament:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createNewTournament16()
