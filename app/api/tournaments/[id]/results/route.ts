import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This is a public API - no authentication required
    const tournamentId = params.id

    // Get tournament with progression data
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
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
        },
        organizer: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Transform the data for public consumption
    const publicTournamentData = {
      id: tournament.id,
      title: tournament.title,
      status: tournament.status,
      currentRound: tournament.currentRound,
      rounds: tournament.rounds.map(round => ({
        id: round.id,
        name: round.name,
        order: round.order,
        maxMatches: round.maxMatches,
        isCompleted: round.isCompleted,
        completedAt: round.completedAt,
        matches: round.matches.map(match => ({
          id: match.id,
          matchCode: match.matchCode,
          player1: match.player1,
          player2: match.player2,
          winner: match.winner,
          score: match.score,
          isCompleted: match.isCompleted,
          scheduledAt: match.scheduledAt,
          completedAt: match.completedAt,
          courtNumber: match.courtNumber,
          judge: match.judge ? {
            id: match.judge.id,
            fullName: match.judge.fullName
          } : null
        }))
      })),
      totalParticipants: tournament.registrations.length,
      maxParticipants: tournament.maxParticipants,
      organizer: tournament.organizer
    }

    return NextResponse.json({
      success: true,
      tournament: publicTournamentData
    })

  } catch (error) {
    console.error('Error fetching public tournament results:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
