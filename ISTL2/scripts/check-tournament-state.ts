import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTournamentState() {
  console.log('🔍 Checking tournament state for Next Round button...')

  try {
    // Get the new tournament
    const tournament = await prisma.tournament.findFirst({
      where: { title: 'New Championship 2024' },
      include: { 
        rounds: { 
          include: { matches: true },
          orderBy: { order: 'asc' }
        } 
      }
    })

    if (!tournament) {
      console.log('❌ New tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title}`)
    console.log(`Status: ${tournament.status}`)
    console.log(`Current Round: ${tournament.currentRound}`)

    console.log('\n📋 ROUND ANALYSIS:')
    tournament.rounds.forEach((round, index) => {
      console.log(`\n${index + 1}. ${round.name} (Order: ${round.order})`)
      console.log(`   - isCompleted: ${round.isCompleted}`)
      console.log(`   - Matches: ${round.matches.length}`)
      console.log(`   - Completed Matches: ${round.matches.filter(m => m.isCompleted).length}`)
      console.log(`   - All Matches Completed: ${round.matches.every(m => m.isCompleted)}`)
      console.log(`   - Is Current Round: ${tournament.currentRound === round.name}`)
      
      // Check if Next Round button should be shown
      const shouldShowButton = tournament.currentRound === round.name && 
                              round.matches.every(m => m.isCompleted) && 
                              !round.isCompleted
      
      console.log(`   - Should Show Next Round Button: ${shouldShowButton}`)
      
      if (round.matches.length > 0) {
        console.log(`   - Match Details:`)
        round.matches.forEach(match => {
          console.log(`     * ${match.matchCode}: ${match.player1} vs ${match.player2}`)
          console.log(`       Winner: ${match.winner || 'Not decided'}`)
          console.log(`       Score: ${match.score || 'Not played'}`)
          console.log(`       Completed: ${match.isCompleted}`)
        })
      }
    })

    // Check why Next Round button might be missing
    console.log('\n🔍 NEXT ROUND BUTTON ANALYSIS:')
    
    const round16 = tournament.rounds.find(r => r.name === 'Round of 16')
    if (round16) {
      console.log(`\nRound of 16 Analysis:`)
      console.log(`- Current Round: ${tournament.currentRound}`)
      console.log(`- Round 16 Name: ${round16.name}`)
      console.log(`- Is Current Round: ${tournament.currentRound === round16.name}`)
      console.log(`- All Matches Completed: ${round16.matches.every(m => m.isCompleted)}`)
      console.log(`- Round Already Completed: ${round16.isCompleted}`)
      
      const buttonCondition1 = tournament.currentRound === round16.name
      const buttonCondition2 = round16.matches.every(m => m.isCompleted)
      const buttonCondition3 = !round16.isCompleted
      
      console.log(`\nButton Conditions:`)
      console.log(`1. Is Current Round: ${buttonCondition1}`)
      console.log(`2. All Matches Completed: ${buttonCondition2}`)
      console.log(`3. Round Not Already Completed: ${buttonCondition3}`)
      
      if (!buttonCondition1) {
        console.log('❌ Issue: Tournament currentRound is not set to "Round of 16"')
        console.log('   Fix: Update tournament.currentRound to "Round of 16"')
      }
      
      if (!buttonCondition2) {
        console.log('❌ Issue: Not all Round of 16 matches are completed')
        console.log('   Fix: Complete all matches in Round of 16')
      }
      
      if (!buttonCondition3) {
        console.log('❌ Issue: Round of 16 is already marked as completed')
        console.log('   Fix: Reset round.isCompleted to false')
      }
    }

  } catch (error) {
    console.error('❌ Error checking tournament state:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTournamentState()
