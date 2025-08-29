import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTournamentCurrentRound() {
  console.log('🔧 Fixing tournament currentRound to show Next Round button...')

  try {
    // Get the new tournament
    const tournament = await prisma.tournament.findFirst({
      where: { title: 'New Championship 2024' }
    })

    if (!tournament) {
      console.log('❌ New tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title}`)
    console.log(`Current Round: ${tournament.currentRound}`)
    console.log(`Status: ${tournament.status}`)

    // Fix the currentRound to "Round of 16"
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentRound: 'Round of 16'
      }
    })

    console.log('✅ Updated tournament currentRound to "Round of 16"')

    // Verify the fix
    const updatedTournament = await prisma.tournament.findFirst({
      where: { id: tournament.id }
    })

    if (updatedTournament) {
      console.log('\n🎯 TOURNAMENT UPDATED:')
      console.log(`Current Round: ${updatedTournament.currentRound}`)
      console.log(`Status: ${updatedTournament.status}`)
      console.log('\n✅ Next Round button should now be visible!')
      console.log('✅ Go to Tournament Progression tab to see the button')
    }

  } catch (error) {
    console.error('❌ Error fixing tournament currentRound:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTournamentCurrentRound()
