import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTournamentCompletely() {
  console.log('🔧 Completely fixing tournament with 16 participants...')

  try {
    // Get the test tournament
    const tournament = await prisma.tournament.findFirst({
      where: { 
        title: 'Test Academy Championship 2024',
        organizerId: { not: undefined }
      }
    })

    if (!tournament) {
      console.log('❌ Test tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title}`)

    // Delete ALL existing data for this tournament
    await prisma.match.deleteMany({
      where: { tournamentId: tournament.id }
    })
    await prisma.tournamentRound.deleteMany({
      where: { tournamentId: tournament.id }
    })
    await prisma.registration.deleteMany({
      where: { tournamentId: tournament.id }
    })

    console.log('🗑️ Cleared all existing data')

    // Add 16 real participants
    const realPlayers = [
      { name: 'Arjun Patel', email: 'arjun.patel@email.com', category: 'ADVANCED', age: 28, gender: 'MALE' },
      { name: 'Priya Sharma', email: 'priya.sharma@email.com', category: 'INTERMEDIATE', age: 25, gender: 'FEMALE' },
      { name: 'Vikram Singh', email: 'vikram.singh@email.com', category: 'ADVANCED', age: 30, gender: 'MALE' },
      { name: 'Ananya Reddy', email: 'ananya.reddy@email.com', category: 'BEGINNER', age: 22, gender: 'FEMALE' },
      { name: 'Rohit Kumar', email: 'rohit.kumar@email.com', category: 'INTERMEDIATE', age: 27, gender: 'MALE' },
      { name: 'Sneha Agarwal', email: 'sneha.agarwal@email.com', category: 'ADVANCED', age: 29, gender: 'FEMALE' },
      { name: 'Karan Mehta', email: 'karan.mehta@email.com', category: 'BEGINNER', age: 24, gender: 'MALE' },
      { name: 'Divya Nair', email: 'divya.nair@email.com', category: 'INTERMEDIATE', age: 26, gender: 'FEMALE' },
      { name: 'Aadhya Gupta', email: 'aadhya.gupta@email.com', category: 'ADVANCED', age: 31, gender: 'FEMALE' },
      { name: 'Ravi Joshi', email: 'ravi.joshi@email.com', category: 'INTERMEDIATE', age: 28, gender: 'MALE' },
      { name: 'Ishaan Verma', email: 'ishaan.verma@email.com', category: 'BEGINNER', age: 23, gender: 'MALE' },
      { name: 'Kavya Iyer', email: 'kavya.iyer@email.com', category: 'ADVANCED', age: 27, gender: 'FEMALE' },
      { name: 'Manish Bansal', email: 'manish.bansal@email.com', category: 'INTERMEDIATE', age: 32, gender: 'MALE' },
      { name: 'Tanya Kapoor', email: 'tanya.kapoor@email.com', category: 'BEGINNER', age: 21, gender: 'FEMALE' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@email.com', category: 'ADVANCED', age: 29, gender: 'MALE' },
      { name: 'Meera Soni', email: 'meera.soni@email.com', category: 'INTERMEDIATE', age: 26, gender: 'FEMALE' }
    ]

    console.log('👥 Creating 16 real players...')

    for (let i = 0; i < realPlayers.length; i++) {
      const player = realPlayers[i]
      
      // Create or get user
      let user = await prisma.user.findUnique({
        where: { email: player.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: player.email,
            name: player.name,
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        })
      }

      // Create registration
      await prisma.registration.create({
        data: {
          tournamentId: tournament.id,
          playerName: player.name,
          playerEmail: player.email,
          playerPhone: `+91-${9000000000 + i}`,
          playerAge: player.age,
          playerGender: player.gender as 'MALE' | 'FEMALE',
          playerCategory: player.category,
          paymentStatus: 'SUCCEEDED',
          registeredAt: new Date(Date.now() - (i * 60000))
        }
      })

      console.log(`  ✅ ${i + 1}/16: ${player.name} (${player.category})`)
    }

    // Create correct rounds for 16 participants
    const rounds = [
      { name: 'Round of 16', order: 1, maxMatches: 8 },
      { name: 'Quarterfinal', order: 2, maxMatches: 4 },
      { name: 'Semifinal', order: 3, maxMatches: 2 },
      { name: 'Final', order: 4, maxMatches: 1 },
      { name: '3rd Place Match', order: 5, maxMatches: 1 }
    ]

    console.log('\n🏆 Creating tournament rounds...')

    // Create rounds
    const createdRounds = await Promise.all(
      rounds.map(round =>
        prisma.tournamentRound.create({
          data: {
            tournamentId: tournament.id,
            name: round.name,
            order: round.order,
            maxMatches: round.maxMatches
          }
        })
      )
    )

    console.log(`✅ Created ${createdRounds.length} rounds`)

    // Generate Round of 16 matches
    const round16 = createdRounds.find(r => r.name === 'Round of 16')
    if (round16) {
      const registrations = await prisma.registration.findMany({
        where: { tournamentId: tournament.id },
        select: { playerName: true }
      })

      const participants = [...registrations]
      
      // Shuffle participants
      for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]]
      }

      const matches = []

      // Create 8 matches for Round of 16
      for (let i = 0; i < 16; i += 2) {
        const matchNumber = Math.floor(i / 2) + 1
        const player1 = participants[i]?.playerName || 'BYE'
        const player2 = participants[i + 1]?.playerName || 'BYE'

        matches.push({
          tournamentId: tournament.id,
          roundId: round16.id,
          matchCode: `R16-M${matchNumber.toString().padStart(2, '0')}`,
          player1,
          player2: player1 === 'BYE' ? null : player2
        })
      }

      await prisma.match.createMany({
        data: matches
      })

      console.log(`✅ Created ${matches.length} matches for Round of 16`)
    }

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentRound: 'Round of 16',
        status: 'ACTIVE'
      }
    })

    console.log('\n🎯 TOURNAMENT COMPLETELY FIXED!')
    console.log('================================')
    console.log(`Tournament: ${tournament.title}`)
    console.log(`Participants: 16/16`)
    console.log(`First Round: Round of 16 (8 matches)`)
    console.log(`Status: ACTIVE`)
    console.log('\n👥 REGISTERED PLAYERS:')
    realPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} - ${player.category}`)
    })

    console.log('\n🚀 Ready to test tournament progression!')
    console.log(`Tournament URL: http://localhost:3000/organizer/test-sports-academy/tournaments/${tournament.id}`)

  } catch (error) {
    console.error('❌ Error fixing tournament:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTournamentCompletely()
