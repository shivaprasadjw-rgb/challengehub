import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRoundStatusUpdate() {
  console.log('🧪 Testing automatic round status updates...')

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
    console.log(`Current rounds: ${tournament.rounds.length}`)

    // Find the Final round
    const finalRound = tournament.rounds.find(r => r.name === 'Final')
    if (!finalRound) {
      console.log('❌ Final round not found')
      return
    }

    console.log(`\n🏆 Final Round Status:`)
    console.log(`  - isCompleted: ${finalRound.isCompleted}`)
    console.log(`  - Matches: ${finalRound.matches.length}`)
    console.log(`  - Completed Matches: ${finalRound.matches.filter(m => m.isCompleted).length}`)

    // Find the 3rd Place Match round
    const thirdPlaceRound = tournament.rounds.find(r => r.name === '3rd Place Match')
    if (!thirdPlaceRound) {
      console.log('❌ 3rd Place Match round not found')
      return
    }

    console.log(`\n🥉 3rd Place Match Round Status:`)
    console.log(`  - isCompleted: ${thirdPlaceRound.isCompleted}`)
    console.log(`  - Matches: ${thirdPlaceRound.matches.length}`)
    console.log(`  - Completed Matches: ${thirdPlaceRound.matches.filter(m => m.isCompleted).length}`)

    // Check if all matches in Final round are completed
    const finalMatchesCompleted = finalRound.matches.every(m => m.isCompleted)
    console.log(`\n📊 Final Round Analysis:`)
    console.log(`  - All matches completed: ${finalMatchesCompleted}`)
    console.log(`  - Round should be marked as completed: ${finalMatchesCompleted}`)

    // Check if all matches in 3rd Place Match round are completed
    const thirdPlaceMatchesCompleted = thirdPlaceRound.matches.every(m => m.isCompleted)
    console.log(`\n📊 3rd Place Match Round Analysis:`)
    console.log(`  - All matches completed: ${thirdPlaceMatchesCompleted}`)
    console.log(`  - Round should be marked as completed: ${thirdPlaceMatchesCompleted}`)

    // If rounds are not marked as completed but should be, manually trigger the status update
    if (finalMatchesCompleted && !finalRound.isCompleted) {
      console.log('\n🔧 Manually updating Final round status...')
      await prisma.tournamentRound.update({
        where: { id: finalRound.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: 'System Test'
        }
      })
      console.log('✅ Final round marked as completed')
    }

    if (thirdPlaceMatchesCompleted && !thirdPlaceRound.isCompleted) {
      console.log('\n🔧 Manually updating 3rd Place Match round status...')
      await prisma.tournamentRound.update({
        where: { id: thirdPlaceRound.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: 'System Test'
        }
      })
      console.log('✅ 3rd Place Match round marked as completed')
    }

    // Check final status
    const updatedTournament = await prisma.tournament.findFirst({
      where: { id: tournament.id },
      include: { rounds: { include: { matches: true } } }
    })

    if (updatedTournament) {
      const updatedFinalRound = updatedTournament.rounds.find(r => r.name === 'Final')
      const updatedThirdPlaceRound = updatedTournament.rounds.find(r => r.name === '3rd Place Match')

      console.log('\n🎯 FINAL STATUS:')
      console.log(`Final Round - isCompleted: ${updatedFinalRound?.isCompleted}`)
      console.log(`3rd Place Match - isCompleted: ${updatedThirdPlaceRound?.isCompleted}`)
    }

  } catch (error) {
    console.error('❌ Error testing round status update:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRoundStatusUpdate()
