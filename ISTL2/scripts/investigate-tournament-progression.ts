import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function investigateTournamentProgression() {
  console.log('🔍 Investigating tournament progression issues...')

  try {
    // Get the test tournament
    const tournament = await prisma.tournament.findFirst({
      where: { title: 'Test Academy Championship 2024' },
      include: { 
        rounds: { 
          include: { matches: true },
          orderBy: { order: 'asc' }
        } 
      }
    })

    if (!tournament) {
      console.log('❌ Test tournament not found')
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
      console.log(`   - Max Matches: ${round.maxMatches}`)
      
      if (round.matches.length > 0) {
        console.log(`   - Match Details:`)
        round.matches.forEach(match => {
          console.log(`     * ${match.matchCode}: ${match.player1} vs ${match.player2}`)
          console.log(`       Winner: ${match.winner || 'Not decided'}`)
          console.log(`       Score: ${match.score || 'Not played'}`)
          console.log(`       Completed: ${match.isCompleted}`)
        })
      } else {
        console.log(`   - ⚠️  NO MATCHES CREATED!`)
      }
    })

    // Check if this is a progression issue
    const hasProgressionIssues = tournament.rounds.some(round => 
      round.name === 'Final' || round.name === '3rd Place Match'
    ) && tournament.rounds.some(round => 
      round.name === 'Round of 16' && round.matches.length > 0
    )

    if (hasProgressionIssues) {
      console.log('\n🚨 PROGRESSION ISSUE DETECTED!')
      console.log('The tournament has Round of 16 matches but no Final/3rd Place matches.')
      console.log('This suggests the tournament progression was not properly completed.')
      
      // Check if we need to create the missing matches
      const round16 = tournament.rounds.find(r => r.name === 'Round of 16')
      const finalRound = tournament.rounds.find(r => r.name === 'Final')
      const thirdPlaceRound = tournament.rounds.find(r => r.name === '3rd Place Match')
      
      if (round16 && round16.matches.length > 0 && finalRound && thirdPlaceRound) {
        console.log('\n🔧 Attempting to fix progression...')
        
        // Get winners from Round of 16
        const round16Winners = round16.matches
          .filter(m => m.isCompleted && m.winner)
          .map(m => m.winner)
        
        console.log(`Round of 16 Winners: ${round16Winners.join(', ')}`)
        
        if (round16Winners.length >= 2) {
          // Create Final match
          await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              roundId: finalRound.id,
              matchCode: 'F-M01',
              player1: round16Winners[0],
              player2: round16Winners[1]
            }
          })
          console.log('✅ Created Final match')
          
          // Create 3rd Place Match (losers from semifinal)
          const semifinalLosers = round16.matches
            .filter(m => m.isCompleted && m.winner)
            .slice(2, 4)
            .map(m => m.winner === m.player1 ? m.player2 : m.player1)
            .filter(Boolean)
          
          if (semifinalLosers.length >= 2) {
            await prisma.match.create({
              data: {
                tournamentId: tournament.id,
                roundId: thirdPlaceRound.id,
                matchCode: '3P-M01',
                player1: semifinalLosers[0],
                player2: semifinalLosers[1]
              }
            })
            console.log('✅ Created 3rd Place Match')
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error investigating tournament progression:', error)
  } finally {
    await prisma.$disconnect()
  }
}

investigateTournamentProgression()
