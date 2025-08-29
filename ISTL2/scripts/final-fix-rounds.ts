import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalFixRounds() {
  console.log('🔧 Final fix for tournament rounds...')

  try {
    // Get the test tournament by ID from the last output
    const tournament = await prisma.tournament.findFirst({
      where: { 
        title: 'Test Academy Championship 2024'
      },
      include: { rounds: true }
    })

    if (!tournament) {
      console.log('❌ Test tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title} (ID: ${tournament.id})`)
    console.log(`Current rounds: ${tournament.rounds.length}`)

    // Delete all existing rounds
    await prisma.tournamentRound.deleteMany({
      where: { tournamentId: tournament.id }
    })

    console.log('🗑️ Deleted existing rounds')

    // Create correct rounds for 16 participants
    const correctRounds = [
      { name: 'Round of 16', order: 1, maxMatches: 8 },
      { name: 'Quarterfinal', order: 2, maxMatches: 4 },
      { name: 'Semifinal', order: 3, maxMatches: 2 },
      { name: 'Final', order: 4, maxMatches: 1 },
      { name: '3rd Place Match', order: 5, maxMatches: 1 }
    ]

    console.log('🏆 Creating correct rounds...')

    // Create rounds
    const createdRounds = await Promise.all(
      correctRounds.map(round =>
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

    console.log('\n🎯 ROUNDS FINALLY FIXED!')
    console.log('=========================')
    console.log(`Tournament: ${tournament.title}`)
    console.log(`First Round: Round of 16 (8 matches)`)
    console.log(`Status: ACTIVE`)
    console.log('\n🚀 Ready to test tournament progression!')

  } catch (error) {
    console.error('❌ Error fixing rounds:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalFixRounds()
