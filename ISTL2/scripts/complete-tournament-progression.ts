import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function completeTournamentProgression() {
  console.log('🏆 Completing tournament progression through all rounds...')

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
    console.log(`Current Status: ${tournament.status}`)

    // Step 1: Complete Round of 16 matches with realistic results
    const round16 = tournament.rounds.find(r => r.name === 'Round of 16')
    if (round16 && round16.matches.length > 0) {
      console.log('\n🎯 Step 1: Completing Round of 16 matches...')
      
      for (const match of round16.matches) {
        if (!match.isCompleted) {
          // Simulate match completion with realistic scores
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
      
      // Mark Round of 16 as completed
      await prisma.tournamentRound.update({
        where: { id: round16.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: 'System'
        }
      })
      console.log('✅ Round of 16 marked as completed')
    }

    // Step 2: Generate Quarterfinal matches
    const quarterfinalRound = tournament.rounds.find(r => r.name === 'Quarterfinal')
    let quarterfinalMatches = []
    if (quarterfinalRound) {
      console.log('\n🎯 Step 2: Generating Quarterfinal matches...')
      
      // Get winners from Round of 16
      const round16Winners = round16!.matches
        .filter(m => m.isCompleted && m.winner)
        .map(m => m.winner)
      
      console.log(`Round of 16 Winners: ${round16Winners.join(', ')}`)
      
      // Create Quarterfinal matches
      for (let i = 0; i < round16Winners.length; i += 2) {
        if (i + 1 < round16Winners.length) {
          const matchNumber = Math.floor(i / 2) + 1
          quarterfinalMatches.push({
            tournamentId: tournament.id,
            roundId: quarterfinalRound.id,
            matchCode: `QF-M${matchNumber.toString().padStart(2, '0')}`,
            player1: round16Winners[i],
            player2: round16Winners[i + 1]
          })
        }
      }
      
      if (quarterfinalMatches.length > 0) {
        await prisma.match.createMany({
          data: quarterfinalMatches
        })
        console.log(`✅ Created ${quarterfinalMatches.length} Quarterfinal matches`)
      }
    }

    // Step 3: Complete Quarterfinal matches
    if (quarterfinalRound) {
      console.log('\n🎯 Step 3: Completing Quarterfinal matches...')
      
      const quarterfinalMatches = await prisma.match.findMany({
        where: { roundId: quarterfinalRound.id }
      })
      
      for (const match of quarterfinalMatches) {
        if (!match.isCompleted) {
          const winner = Math.random() > 0.5 ? match.player1 : match.player2
          const score = `${Math.floor(Math.random() * 10) + 18}-${Math.floor(Math.random() * 10) + 12}`
          
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
      
      // Mark Quarterfinal as completed
      await prisma.tournamentRound.update({
        where: { id: quarterfinalRound.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: 'System'
        }
      })
      console.log('✅ Quarterfinal marked as completed')
    }

    // Step 4: Generate Semifinal matches
    const semifinalRound = tournament.rounds.find(r => r.name === 'Semifinal')
    let semifinalMatches = []
    if (semifinalRound) {
      console.log('\n🎯 Step 2: Generating Quarterfinal matches...')
      
      // Get winners from Quarterfinal
      const quarterfinalMatches = await prisma.match.findMany({
        where: { roundId: quarterfinalRound!.id }
      })
      
      const quarterfinalWinners = quarterfinalMatches
        .filter(m => m.isCompleted && m.winner)
        .map(m => m.winner)
      
      console.log(`Quarterfinal Winners: ${quarterfinalWinners.join(', ')}`)
      
      // Create Semifinal matches
      for (let i = 0; i < quarterfinalWinners.length; i += 2) {
        if (i + 1 < quarterfinalWinners.length) {
          const matchNumber = Math.floor(i / 2) + 1
          semifinalMatches.push({
            tournamentId: tournament.id,
            roundId: semifinalRound.id,
            matchCode: `SF-M${matchNumber.toString().padStart(2, '0')}`,
            player1: quarterfinalWinners[i],
            player2: quarterfinalWinners[i + 1]
          })
        }
      }
      
      if (semifinalMatches.length > 0) {
        await prisma.match.createMany({
          data: semifinalMatches
        })
        console.log(`✅ Created ${semifinalMatches.length} Semifinal matches`)
      }
    }

    // Step 5: Complete Semifinal matches
    if (semifinalRound) {
      console.log('\n🎯 Step 5: Completing Semifinal matches...')
      
      const semifinalMatches = await prisma.match.findMany({
        where: { roundId: semifinalRound.id }
      })
      
      for (const match of semifinalMatches) {
        if (!match.isCompleted) {
          const winner = Math.random() > 0.5 ? match.player1 : match.player2
          const score = `${Math.floor(Math.random() * 10) + 20}-${Math.floor(Math.random() * 10) + 15}`
          
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
      
      // Mark Semifinal as completed
      await prisma.tournamentRound.update({
        where: { id: semifinalRound.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: 'System'
        }
      })
      console.log('✅ Semifinal marked as completed')
    }

    // Step 6: Generate Final and 3rd Place Match
    const finalRound = tournament.rounds.find(r => r.name === 'Final')
    const thirdPlaceRound = tournament.rounds.find(r => r.name === '3rd Place Match')
    
    if (finalRound && thirdPlaceRound) {
      console.log('\n🎯 Step 6: Generating Final and 3rd Place Match...')
      
      // Get winners from Semifinal for Final
      const semifinalMatches = await prisma.match.findMany({
        where: { roundId: semifinalRound!.id }
      })
      
      const semifinalWinners = semifinalMatches
        .filter(m => m.isCompleted && m.winner)
        .map(m => m.winner)
      
      if (semifinalWinners.length >= 2) {
        // Create Final match
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            roundId: finalRound.id,
            matchCode: 'F-M01',
            player1: semifinalWinners[0],
            player2: semifinalWinners[1]
          }
        })
        console.log('✅ Created Final match')
        
        // Create 3rd Place Match (losers from semifinal)
        const semifinalLosers = semifinalMatches
          .filter(m => m.isCompleted && m.winner)
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

    // Step 7: Complete Final and 3rd Place Match
    if (finalRound && thirdPlaceRound) {
      console.log('\n🎯 Step 7: Completing Final and 3rd Place Match...')
      
      // Complete Final match
      const finalMatch = await prisma.match.findFirst({
        where: { roundId: finalRound.id }
      })
      
      if (finalMatch) {
        const winner = Math.random() > 0.5 ? finalMatch.player1 : finalMatch.player2
        const score = `${Math.floor(Math.random() * 10) + 21}-${Math.floor(Math.random() * 10) + 18}`
        
        await prisma.match.update({
          where: { id: finalMatch.id },
          data: {
            winner,
            score,
            isCompleted: true,
            completedAt: new Date()
          }
        })
        
        console.log(`  ✅ Final: ${finalMatch.player1} vs ${finalMatch.player2} → Winner: ${winner} (${score})`)
        
        // Mark Final as completed
        await prisma.tournamentRound.update({
          where: { id: finalRound.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            completedBy: 'System'
          }
        })
        console.log('✅ Final round marked as completed')
      }
      
      // Complete 3rd Place Match
      const thirdPlaceMatch = await prisma.match.findFirst({
        where: { roundId: thirdPlaceRound.id }
      })
      
      if (thirdPlaceMatch) {
        const winner = Math.random() > 0.5 ? thirdPlaceMatch.player1 : thirdPlaceMatch.player2
        const score = `${Math.floor(Math.random() * 10) + 19}-${Math.floor(Math.random() * 10) + 16}`
        
        await prisma.match.update({
          where: { id: thirdPlaceMatch.id },
          data: {
            winner,
            score,
            isCompleted: true,
            completedAt: new Date()
          }
        })
        
        console.log(`  ✅ 3rd Place: ${thirdPlaceMatch.player1} vs ${thirdPlaceMatch.player2} → Winner: ${winner} (${score})`)
        
        // Mark 3rd Place Match as completed
        await prisma.tournamentRound.update({
          where: { id: thirdPlaceRound.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            completedBy: 'System'
          }
        })
        console.log('✅ 3rd Place Match round marked as completed')
      }
    }

    // Step 8: Update tournament status to COMPLETED
    console.log('\n🎯 Step 8: Updating tournament status...')
    
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        status: 'COMPLETED',
        currentRound: 'Tournament Completed'
      }
    })
    
    console.log('✅ Tournament status updated to COMPLETED')
    console.log('✅ Current round updated to "Tournament Completed"')

    console.log('\n🏆 TOURNAMENT PROGRESSION COMPLETED SUCCESSFULLY!')
    console.log('==================================================')
    console.log('All rounds have been completed with realistic match results.')
    console.log('Tournament status: COMPLETED')
    console.log('Ready for final review and winner announcement!')

  } catch (error) {
    console.error('❌ Error completing tournament progression:', error)
  } finally {
    await prisma.$disconnect()
  }
}

completeTournamentProgression()
