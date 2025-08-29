import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAllTournaments() {
  console.log('📋 Listing all tournaments...')

  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        rounds: {
          include: { matches: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n🏆 Found ${tournaments.length} tournaments:\n`)

    tournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.title}`)
      console.log(`   ID: ${tournament.id}`)
      console.log(`   Status: ${tournament.status}`)
      console.log(`   Current Round: ${tournament.currentRound}`)
      console.log(`   Rounds: ${tournament.rounds.length}`)
      console.log(`   Created: ${tournament.createdAt.toLocaleDateString()}`)
      console.log(`   URL: http://localhost:3000/organizer/sports-india/tournaments/${tournament.id}`)
      console.log('')
    })

    // Find the new tournament specifically
    const newTournament = tournaments.find(t => t.title === 'New Championship 2024')
    if (newTournament) {
      console.log('🎯 NEW TOURNAMENT DETAILS:')
      console.log(`Title: ${newTournament.title}`)
      console.log(`ID: ${newTournament.id}`)
      console.log(`Current Round: ${newTournament.currentRound}`)
      console.log(`Status: ${newTournament.status}`)
      console.log(`\n✅ CORRECT URL FOR NEW TOURNAMENT:`)
      console.log(`http://localhost:3000/organizer/sports-india/tournaments/${newTournament.id}`)
      console.log(`\n🎯 PROGRESSION TAB:`)
      console.log(`http://localhost:3000/organizer/sports-india/tournaments/${newTournament.id}/progression`)
    } else {
      console.log('❌ New Championship 2024 not found!')
    }

  } catch (error) {
    console.error('❌ Error listing tournaments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAllTournaments()
