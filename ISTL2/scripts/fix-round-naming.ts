import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRoundNaming() {
  console.log('🔧 Fixing tournament round naming for 16 participants...')

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

    // Delete existing rounds and matches
    await prisma.match.deleteMany({
      where: { tournamentId: tournament.id }
    })
    await prisma.tournamentRound.deleteMany({
      where: { tournamentId: tournament.id }
    })

    console.log('🗑️ Cleared existing progression data')

    // Get participant count
    const participantCount = await prisma.registration.count({
      where: { tournamentId: tournament.id }
    })

    console.log(`👥 Total participants: ${participantCount}`)

    // Create correct rounds based on participant count
    let firstRoundName = 'Round of 16'
    let firstRoundMatches = 8
    
    if (participantCount > 16) {
      firstRoundName = 'Round of 32'
      firstRoundMatches = 16
    } else if (participantCount > 8) {
      firstRoundName = 'Round of 16'
      firstRoundMatches = 8
    } else if (participantCount > 4) {
      firstRoundName = 'Quarterfinal'
      firstRoundMatches = 4
    } else if (participantCount > 2) {
      firstRoundName = 'Semifinal'
      firstRoundMatches = 2
    }

    console.log(`🏆 First round: ${firstRoundName} (${firstRoundMatches} matches)`)

    // Create tournament rounds
    const rounds = [
      { name: firstRoundName, order: 1, maxMatches: firstRoundMatches },
      { name: 'Round of 16', order: 2, maxMatches: 8 },
      { name: 'Quarterfinal', order: 3, maxMatches: 4 },
      { name: 'Semifinal', order: 4, maxMatches: 2 },
      { name: 'Final', order: 6, maxMatches: 1 },
      { name: '3rd Place Match', order: 5, maxMatches: 1 }
    ]

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

    // Generate first round matches
    const firstRound = createdRounds.find(r => r.name === firstRoundName)
    if (firstRound) {
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

      // Create matches for the first round
      for (let i = 0; i < Math.min(participants.length, firstRoundMatches * 2); i += 2) {
        const matchNumber = Math.floor(i / 2) + 1
        const player1 = participants[i]?.playerName || 'BYE'
        const player2 = participants[i + 1]?.playerName || 'BYE'

        // Generate match code based on first round name
        let matchCode = ''
        if (firstRoundName === 'Round of 32') {
          matchCode = `R32-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Round of 16') {
          matchCode = `R16-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Quarterfinal') {
          matchCode = `QF-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Semifinal') {
          matchCode = `SF-M${matchNumber.toString().padStart(2, '0')}`
        }

        matches.push({
          tournamentId: tournament.id,
          roundId: firstRound.id,
          matchCode,
          player1,
          player2: player1 === 'BYE' ? null : player2
        })
      }

      await prisma.match.createMany({
        data: matches
      })

      console.log(`✅ Created ${matches.length} matches for ${firstRoundName}`)
    }

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentRound: firstRoundName,
        status: 'ACTIVE'
      }
    })

    console.log('\n🎯 ROUND NAMING FIXED!')
    console.log('========================')
    console.log(`Tournament: ${tournament.title}`)
    console.log(`Participants: ${participantCount}`)
    console.log(`First Round: ${firstRoundName}`)
    console.log(`Status: ACTIVE`)
    console.log('\n🚀 Ready to test tournament progression!')
    console.log(`Tournament URL: http://localhost:3000/organizer/test-sports-academy/tournaments/${tournament.id}`)

  } catch (error) {
    console.error('❌ Error fixing round naming:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRoundNaming()
