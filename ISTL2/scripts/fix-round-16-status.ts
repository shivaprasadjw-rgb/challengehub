import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRound16Status() {
  console.log('🔧 Fixing Round of 16 status and completing matches...')

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
    console.log(`Current Round: ${tournament.currentRound}`)

    // Step 1: Reset Round of 16 to not completed
    const round16 = tournament.rounds.find(r => r.name === 'Round of 16')
    if (round16) {
      console.log('\n🎯 Step 1: Resetting Round of 16 status...')
      
      await prisma.tournamentRound.update({
        where: { id: round16.id },
        data: {
          isCompleted: false,
          completedAt: null,
          completedBy: null
        }
      })
      
      console.log('✅ Round of 16 marked as not completed')
    }

    // Step 2: Complete some matches to test progression
    console.log('\n🎯 Step 2: Completing some Round of 16 matches...')
    
    if (round16 && round16.matches.length > 0) {
      // Complete first 4 matches
      for (let i = 0; i < 4; i++) {
        const match = round16.matches[i]
        if (!match.isCompleted) {
          const winner = Math.random() > 0.5 ? match.player1 : match.player2
          const score = `${Math.floor(Math.random() * 10) + 15}-${Math.floor(Math.random() * 10) + 10}`
          
          await prisma.match.update({
            where: { id: match.id },
            data: {
              winner,
              score,
              isCompleted: true,
              completedAt: new Date()
            }
          })
          
          console.log(`  ✅ ${match.matchCode}: ${match.player1} vs ${match.player2} → Winner: ${winner} (${score})`)
        }
      }
      
      console.log('✅ Completed 4 matches in Round of 16')
    }

    // Step 3: Verify the fix
    console.log('\n🎯 Step 3: Verifying the fix...')
    
    const updatedRound16 = await prisma.tournamentRound.findUnique({
      where: { id: round16.id },
      include: { matches: true }
    })
    
    if (updatedRound16) {
      console.log(`\nRound of 16 Status:`)
      console.log(`- isCompleted: ${updatedRound16.isCompleted}`)
      console.log(`- Matches: ${updatedRound16.matches.length}`)
      console.log(`- Completed Matches: ${updatedRound16.matches.filter(m => m.isCompleted).length}`)
      console.log(`- All Matches Completed: ${updatedRound16.matches.every(m => m.isCompleted)}`)
      
      // Check if Next Round button should be shown
      const shouldShowButton = tournament.currentRound === updatedRound16.name && 
                              updatedRound16.matches.every(m => m.isCompleted) && 
                              !updatedRound16.isCompleted
      
      console.log(`\nNext Round Button Analysis:`)
      console.log(`- Is Current Round: ${tournament.currentRound === updatedRound16.name}`)
      console.log(`- All Matches Completed: ${updatedRound16.matches.every(m => m.isCompleted)}`)
      console.log(`- Round Not Completed: ${!updatedRound16.isCompleted}`)
      console.log(`- Should Show Next Round Button: ${shouldShowButton}`)
      
      if (shouldShowButton) {
        console.log('\n✅ SUCCESS! Next Round button should now be visible!')
        console.log('✅ Go to Tournament Progression tab to see the button')
      } else {
        console.log('\n❌ Next Round button still not ready. Need to complete more matches.')
      }
    }

  } catch (error) {
    console.error('❌ Error fixing Round of 16 status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRound16Status()
