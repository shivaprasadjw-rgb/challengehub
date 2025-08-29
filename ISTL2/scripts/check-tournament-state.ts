import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTournamentState() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { title: 'Test Academy Championship 2024' },
      include: { 
        rounds: true, 
        registrations: true 
      }
    })

    if (!tournament) {
      console.log('❌ Tournament not found')
      return
    }

    console.log('🏆 Tournament:', tournament.title)
    console.log('👥 Participants:', tournament.registrations.length)
    console.log('📊 Status:', tournament.status)
    console.log('🔄 Current Round:', tournament.currentRound)
    console.log('\n📋 Rounds:')
    tournament.rounds.forEach(round => {
      console.log(`  - ${round.name} (Order: ${round.order}, Max Matches: ${round.maxMatches})`)
    })

    console.log('\n👥 Registrations:')
    tournament.registrations.forEach((reg, i) => {
      console.log(`  ${i + 1}. ${reg.playerName}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTournamentState()
