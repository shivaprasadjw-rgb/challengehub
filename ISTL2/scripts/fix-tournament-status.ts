import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTournamentStatus() {
  console.log('🔧 Fixing tournament status from ACTIVE to COMPLETED...')

  try {
    // Get the test tournament
    const tournament = await prisma.tournament.findFirst({
      where: { title: 'Test Academy Championship 2024' },
      include: { rounds: { include: { matches: true } } }
    })

    if (!tournament) {
      console.log('❌ Test tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title}`)
    console.log(`Current Status: ${tournament.status}`)
    console.log(`Current Round: ${tournament.currentRound}`)

    // Check if all rounds are completed
    const allRoundsCompleted = tournament.rounds.every(round => round.isCompleted)
    console.log(`All rounds completed: ${allRoundsCompleted}`)

    // Check if Final and 3rd Place Match rounds exist and are completed
    const finalRound = tournament.rounds.find(r => r.name === 'Final')
    const thirdPlaceRound = tournament.rounds.find(r => r.name === '3rd Place Match')

    if (finalRound && thirdPlaceRound) {
      console.log(`\n🏆 Final Round:`)
      console.log(`  - isCompleted: ${finalRound.isCompleted}`)
      console.log(`  - Matches: ${finalRound.matches.length}`)
      console.log(`  - Completed Matches: ${finalRound.matches.filter(m => m.isCompleted).length}`)

      console.log(`\n🥉 3rd Place Match Round:`)
      console.log(`  - isCompleted: ${thirdPlaceRound.isCompleted}`)
      console.log(`  - Matches: ${thirdPlaceRound.matches.length}`)
      console.log(`  - Completed Matches: ${thirdPlaceRound.matches.filter(m => m.isCompleted).length}`)

      // If both Final and 3rd Place Match rounds are completed, tournament should be COMPLETED
      if (finalRound.isCompleted && thirdPlaceRound.isCompleted) {
        console.log('\n🎯 Tournament should be marked as COMPLETED!')
        
        // Update tournament status
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: {
            status: 'COMPLETED',
            currentRound: 'Tournament Completed'
          }
        })

        console.log('✅ Tournament status updated to COMPLETED')
        console.log('✅ Current round updated to "Tournament Completed"')
      }
    }

    // Verify the fix
    const updatedTournament = await prisma.tournament.findFirst({
      where: { id: tournament.id }
    })

    if (updatedTournament) {
      console.log('\n🎯 FINAL TOURNAMENT STATUS:')
      console.log(`Status: ${updatedTournament.status}`)
      console.log(`Current Round: ${updatedTournament.currentRound}`)
    }

  } catch (error) {
    console.error('❌ Error fixing tournament status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTournamentStatus()
