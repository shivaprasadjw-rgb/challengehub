import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixThirdPlaceMatch() {
  const tournamentId = 'cmeuwctui00016u6a9zjvtsbh'
  
  console.log('🔍 Checking tournament state...')
  
  // Get tournament and its rounds
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      rounds: {
        include: {
          matches: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }

  console.log(`📊 Tournament: ${tournament.title}`)
  console.log(`📍 Current Round: ${tournament.currentRound}`)
  console.log(`🏆 Status: ${tournament.status}`)

  // Find semifinals and 3rd place match rounds
  const semifinalRound = tournament.rounds.find(r => r.name === 'Semifinal')
  const thirdPlaceRound = tournament.rounds.find(r => r.name === '3rd Place Match')

  if (!semifinalRound) {
    console.error('❌ Semifinal round not found')
    return
  }

  if (!thirdPlaceRound) {
    console.error('❌ 3rd Place Match round not found')
    return
  }

  console.log(`\n🥉 Checking 3rd Place Match...`)
  console.log(`Existing matches in 3rd Place Match round: ${thirdPlaceRound.matches.length}`)

  // Check if 3rd place match already exists
  if (thirdPlaceRound.matches.length > 0) {
    console.log('✅ 3rd Place Match already exists')
    thirdPlaceRound.matches.forEach(match => {
      console.log(`   Match: ${match.matchCode} - ${match.player1} vs ${match.player2}`)
      console.log(`   Completed: ${match.isCompleted ? 'Yes' : 'No'}`)
      if (match.winner) {
        console.log(`   Winner: ${match.winner} (${match.score})`)
      }
    })
    return
  }

  // Check semifinal matches
  console.log(`\n🔍 Checking Semifinal matches...`)
  const semifinalMatches = semifinalRound.matches.filter(m => m.isCompleted)
  console.log(`Completed semifinal matches: ${semifinalMatches.length}/${semifinalRound.matches.length}`)

  if (semifinalMatches.length < 2) {
    console.error('❌ Not enough completed semifinal matches to create 3rd Place Match')
    return
  }

  // Get the losers from semifinal matches
  const losers = semifinalMatches.map(match => {
    if (match.winner === match.player1) {
      return match.player2
    } else {
      return match.player1
    }
  }).filter(Boolean)

  console.log(`\n🥈 Semifinal losers:`, losers)

  if (losers.length < 2) {
    console.error('❌ Not enough losers to create 3rd Place Match')
    return
  }

  // Create the 3rd Place Match
  console.log(`\n🏗️ Creating 3rd Place Match...`)
  const thirdPlaceMatch = await prisma.match.create({
    data: {
      tournamentId,
      roundId: thirdPlaceRound.id,
      matchCode: '3P-M01',
      player1: losers[0],
      player2: losers[1]
    }
  })

  console.log(`✅ Created 3rd Place Match: ${thirdPlaceMatch.matchCode}`)
  console.log(`   Players: ${thirdPlaceMatch.player1} vs ${thirdPlaceMatch.player2}`)

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorUserId: null,
      organizerId: null,
      action: 'CREATE_THIRD_PLACE_MATCH',
      entityType: 'Match',
      entityId: thirdPlaceMatch.id,
      tournamentId: tournamentId,
      meta: {
        matchCode: thirdPlaceMatch.matchCode,
        player1: thirdPlaceMatch.player1,
        player2: thirdPlaceMatch.player2,
        note: 'Manually fixed missing 3rd Place Match'
      }
    }
  })

  console.log(`\n🎾 3rd Place Match successfully created and ready for play! 🚀`)
  
  await prisma.$disconnect()
}

fixThirdPlaceMatch().catch(console.error)
