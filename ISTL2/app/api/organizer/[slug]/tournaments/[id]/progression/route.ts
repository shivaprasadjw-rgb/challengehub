import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === params.slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Get tournament with progression data
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      },
      include: {
        rounds: {
          include: {
            matches: {
              include: {
                judge: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              },
              orderBy: {
                matchCode: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        registrations: {
          select: {
            id: true,
            playerName: true,
            playerEmail: true,
            playerCategory: true
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        title: tournament.title,
        status: tournament.status,
        currentRound: tournament.currentRound,
        rounds: tournament.rounds,
        totalParticipants: tournament.registrations.length,
        maxParticipants: tournament.maxParticipants
      }
    })

  } catch (error) {
    console.error('Error fetching tournament progression:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === params.slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { action, data } = await req.json()

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Get tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    switch (action) {
      case 'initialize':
        return await initializeTournamentProgression(params.id, session.user.name || 'Unknown')
      
      case 'update_match':
        return await updateMatchResult(data.matchId, data.winner, data.score, session.user.name || 'Unknown')
      
      case 'advance_round':
        return await advanceToNextRound(params.id, data.currentRound, session.user.name || 'Unknown')
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error updating tournament progression:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function initializeTournamentProgression(tournamentId: string, adminUser: string) {
  try {
    // Get tournament participants
    const registrations = await prisma.registration.findMany({
      where: { tournamentId },
      select: {
        playerName: true,
        playerEmail: true,
        playerCategory: true
      }
    })

    if (registrations.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 400 })
    }

    // Create tournament rounds based on participant count
    const participantCount = registrations.length
    let firstRoundName = 'Round of 16'
    let firstRoundMatches = 8
    
    if (participantCount > 16) {
      firstRoundName = 'Round of 32'
      firstRoundMatches = 16
    } else if (participantCount > 8) {
      firstRoundName = 'Round of 16'
      firstRoundMatches = 8
    } else if (participantCount > 4) {
      firstRoundName = 'Quarterfinal'
      firstRoundMatches = 4
    } else if (participantCount > 2) {
      firstRoundName = 'Semifinal'
      firstRoundMatches = 2
    }
    
    const rounds = [
      { name: firstRoundName, order: 1, maxMatches: firstRoundMatches },
      { name: 'Round of 16', order: 2, maxMatches: 8 },
      { name: 'Quarterfinal', order: 3, maxMatches: 4 },
      { name: 'Semifinal', order: 4, maxMatches: 2 },
      { name: 'Final', order: 6, maxMatches: 1 },
      { name: '3rd Place Match', order: 5, maxMatches: 1 }
    ]

    // Delete existing rounds and matches for this tournament
    await prisma.match.deleteMany({
      where: { tournamentId }
    })
    await prisma.tournamentRound.deleteMany({
      where: { tournamentId }
    })

    // Create rounds
    const createdRounds = await Promise.all(
      rounds.map(round =>
        prisma.tournamentRound.create({
          data: {
            tournamentId,
            name: round.name,
            order: round.order,
            maxMatches: round.maxMatches
          }
        })
      )
    )

    // Generate first round matches
    const firstRound = createdRounds.find(r => r.name === firstRoundName)
    if (firstRound) {
      const matches = []
      const participants = [...registrations]
      
      // Shuffle participants
      for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]]
      }

      // Create matches for the first round
      for (let i = 0; i < Math.min(participants.length, firstRoundMatches * 2); i += 2) {
        const matchNumber = Math.floor(i / 2) + 1
        const player1 = participants[i]?.playerName || 'BYE'
        const player2 = participants[i + 1]?.playerName || 'BYE'

        // Generate match code based on first round name
        let matchCode = ''
        if (firstRoundName === 'Round of 32') {
          matchCode = `R32-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Round of 16') {
          matchCode = `R16-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Quarterfinal') {
          matchCode = `QF-M${matchNumber.toString().padStart(2, '0')}`
        } else if (firstRoundName === 'Semifinal') {
          matchCode = `SF-M${matchNumber.toString().padStart(2, '0')}`
        }

        matches.push({
          tournamentId,
          roundId: firstRound.id,
          matchCode,
          player1,
          player2: player1 === 'BYE' ? null : player2
        })
      }

      await prisma.match.createMany({
        data: matches
      })
    }

    // Update tournament status
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentRound: firstRoundName,
        status: 'ACTIVE'
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: null,
        action: 'INITIALIZE_TOURNAMENT_PROGRESSION',
        entityType: 'Tournament',
        entityId: tournamentId,
        tournamentId: tournamentId,
        meta: {
          totalParticipants: registrations.length,
          roundsCreated: rounds.length,
          adminUser
        }
      }
    })

    return NextResponse.json({
      message: 'Tournament progression initialized successfully',
      totalParticipants: registrations.length,
      roundsCreated: rounds.length
    })

  } catch (error) {
    console.error('Error initializing tournament progression:', error)
    return NextResponse.json(
      { error: 'Failed to initialize tournament progression' },
      { status: 500 }
    )
  }
}

async function updateMatchResult(matchId: string, winner: string, score: string, adminUser: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { round: true, tournament: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Update match result
    await prisma.match.update({
      where: { id: matchId },
      data: {
        winner,
        score,
        isCompleted: true,
        completedAt: new Date()
      }
    })

    // Check if all matches in this round are completed and update round status
    await checkAndUpdateRoundStatus(match.roundId, adminUser)

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: null,
        action: 'UPDATE_MATCH_RESULT',
        entityType: 'Match',
        entityId: matchId,
        tournamentId: match.tournamentId,
        meta: {
          matchCode: match.matchCode,
          winner,
          score,
          round: match.round.name,
          adminUser
        }
      }
    })

    return NextResponse.json({
      message: 'Match result updated successfully',
      matchCode: match.matchCode,
      winner,
      score
    })

  } catch (error) {
    console.error('Error updating match result:', error)
    return NextResponse.json(
      { error: 'Failed to update match result' },
      { status: 500 }
    )
  }
}

async function advanceToNextRound(tournamentId: string, currentRoundName: string, adminUser: string) {
  try {
    // Get current round and its completed matches
    const currentRound = await prisma.tournamentRound.findFirst({
      where: {
        tournamentId,
        name: currentRoundName
      },
      include: {
        matches: {
          where: { isCompleted: true }
        }
      }
    })

    if (!currentRound) {
      return NextResponse.json({ error: 'Current round not found' }, { status: 404 })
    }

    // Check if all matches in current round are completed
    const allMatches = await prisma.match.count({
      where: { roundId: currentRound.id }
    })

    if (currentRound.matches.length !== allMatches) {
      return NextResponse.json({ 
        error: 'All matches in current round must be completed before advancing' 
      }, { status: 400 })
    }

    // Mark current round as completed
    await prisma.tournamentRound.update({
      where: { id: currentRound.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: adminUser
      }
    })

    // Generate next round matches
    const nextRoundName = getNextRoundName(currentRoundName)
    if (nextRoundName) {
      await generateNextRoundMatches(tournamentId, currentRound.matches, nextRoundName)
      
      // Special case: After Semifinal, also create 3rd Place Match
      if (currentRoundName === 'Semifinal') {
        await generate3rdPlaceMatch(tournamentId, currentRound.matches)
      }
      
      // Update tournament current round
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { currentRound: nextRoundName }
      })
    } else {
      // Tournament completed
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { 
          status: 'COMPLETED',
          currentRound: 'Tournament Completed'
        }
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: null,
        action: 'ADVANCE_TOURNAMENT_ROUND',
        entityType: 'Tournament',
        entityId: tournamentId,
        tournamentId: tournamentId,
        meta: {
          fromRound: currentRoundName,
          toRound: nextRoundName || 'Tournament Completed',
          completedMatches: currentRound.matches.length,
          adminUser
        }
      }
    })

    return NextResponse.json({
      message: `Round advanced successfully`,
      fromRound: currentRoundName,
      toRound: nextRoundName || 'Tournament Completed',
      completedMatches: currentRound.matches.length
    })

  } catch (error) {
    console.error('Error advancing tournament round:', error)
    return NextResponse.json(
      { error: 'Failed to advance tournament round' },
      { status: 500 }
    )
  }
}

function getNextRoundName(currentRound: string): string | null {
  const progression: { [key: string]: string } = {
    'Round of 32': 'Round of 16',
    'Round of 16': 'Quarterfinal',
    'Quarterfinal': 'Semifinal',
    'Semifinal': 'Final',
    '3rd Place Match': null, // 3rd Place Match doesn't advance further
    'Final': null // Final doesn't advance further
  }
  
  // Handle dynamic first round names
  if (currentRound.includes('Round of')) {
    const participantCount = parseInt(currentRound.split(' ')[2])
    if (participantCount > 16) {
      return 'Round of 16'
    } else if (participantCount > 8) {
      return 'Quarterfinal'
    } else if (participantCount > 4) {
      return 'Semifinal'
    } else if (participantCount > 2) {
      return 'Final'
    }
  }
  
  return progression[currentRound] || null
}

async function generateNextRoundMatches(tournamentId: string, completedMatches: any[], nextRoundName: string) {
  // Get the next round
  const nextRound = await prisma.tournamentRound.findFirst({
    where: {
      tournamentId,
      name: nextRoundName
    }
  })

  if (!nextRound) return

  // Generate matches for next round based on winners
  const winners = completedMatches.map(match => match.winner).filter(Boolean)
  const matches = []

  for (let i = 0; i < winners.length; i += 2) {
    const matchNumber = Math.floor(i / 2) + 1
    const player1 = winners[i]
    const player2 = winners[i + 1] || 'BYE'

    const roundCode = nextRoundName === 'Round of 32' ? 'R32' :
                     nextRoundName === 'Round of 16' ? 'R16' :
                     nextRoundName === 'Quarterfinal' ? 'QF' :
                     nextRoundName === 'Semifinal' ? 'SF' :
                     nextRoundName === 'Final' ? 'F' : 'M'

    matches.push({
      tournamentId,
      roundId: nextRound.id,
      matchCode: `${roundCode}-M${matchNumber.toString().padStart(2, '0')}`,
      player1,
      player2: player2 === 'BYE' ? null : player2
    })
  }

  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches
    })
  }
}

async function generate3rdPlaceMatch(tournamentId: string, semifinalMatches: any[]) {
  // Get the 3rd Place Match round
  const thirdPlaceRound = await prisma.tournamentRound.findFirst({
    where: {
      tournamentId,
      name: '3rd Place Match'
    }
  })

  if (!thirdPlaceRound) return

  // Get the losers from semifinal matches
  const losers = semifinalMatches.map(match => {
    if (match.winner === match.player1) {
      return match.player2
    } else {
      return match.player1
    }
  }).filter(Boolean)

  if (losers.length >= 2) {
    const match = {
      tournamentId,
      roundId: thirdPlaceRound.id,
      matchCode: '3P-M01',
      player1: losers[0],
      player2: losers[1]
    }

    await prisma.match.create({
      data: match
    })
  }
}

async function checkAndUpdateRoundStatus(roundId: string, adminUser: string) {
  try {
    // Get the round with all its matches
    const round = await prisma.tournamentRound.findUnique({
      where: { id: roundId },
      include: {
        matches: true
      }
    })

    if (!round) return

    // Count total matches and completed matches
    const totalMatches = round.matches.length
    const completedMatches = round.matches.filter(match => match.isCompleted).length

    // If all matches are completed, mark the round as completed
    if (totalMatches > 0 && completedMatches === totalMatches) {
      await prisma.tournamentRound.update({
        where: { id: roundId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: adminUser
        }
      })

      console.log(`✅ Round "${round.name}" marked as completed (${completedMatches}/${totalMatches} matches)`)

      // Special case: If this is the Final round and it's completed, mark tournament as completed
      if (round.name === 'Final') {
        await prisma.tournament.update({
          where: { id: round.tournamentId },
          data: {
            status: 'COMPLETED',
            currentRound: 'Tournament Completed'
          }
        })
        console.log('🏆 Tournament marked as completed!')
      }
    }
  } catch (error) {
    console.error('Error checking and updating round status:', error)
  }
}
