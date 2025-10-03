import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { tid: string } }
) {
  try {
    const tournamentId = params.tid;
    
    // Find tournament by ID
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId
      },
      include: {
        organizer: true,
        venue: true,
        registrations: {
          select: {
            id: true,
            playerName: true,
            playerEmail: true,
            playerPhone: true,
            playerAge: true,
            playerGender: true,
            playerCategory: true,
            paymentStatus: true,
            registeredAt: true
          },
          orderBy: {
            registeredAt: 'asc'
          }
        },
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
        }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Transform data to match the expected format
    const transformedTournament = {
      id: tournament.id,
      name: tournament.title,
      date: tournament.date?.toISOString().split('T')[0] || null,
      status: tournament.status === 'COMPLETED' ? 'Completed' : 
              tournament.status === 'ACTIVE' ? 'Upcoming' : tournament.status,
      sport: tournament.sport,
      format: 'Singles',
      category: 'Open Category',
      entryFee: tournament.entryFee,
      registrationDeadline: null,
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.registrations.length,
      organizer: {
        name: tournament.organizer.name,
        phone: (tournament.organizer.contact as any)?.phone,
        email: (tournament.organizer.contact as any)?.email
      },
      venue: tournament.venue ? {
        id: tournament.venue.id,
        name: tournament.venue.name,
        locality: tournament.venue.locality,
        city: tournament.venue.city,
        state: tournament.venue.state,
        pincode: tournament.venue.pincode,
        lat: null,
        lng: null
      } : null,
      schedule: tournament.status === 'COMPLETED' ? 
        // For completed tournaments, generate schedule from actual matches
        tournament.rounds.flatMap(round => 
          round.matches.map(match => ({
            code: match.matchCode,
            date: match.scheduledAt ? new Date(match.scheduledAt).toISOString().split('T')[0] : 
                   tournament.date?.toISOString().split('T')[0] || null,
            start: match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : "TBD",
            end: match.scheduledAt ? new Date(new Date(match.scheduledAt).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }) : "TBD",
            round: round.name,
            players: match.player1 && match.player2 ? `${match.player1} vs ${match.player2}` : "TBD",
            winner: match.winner,
            isCompleted: match.isCompleted
          }))
        ) :
        // For non-completed tournaments, show registrations
        tournament.registrations.map((reg, index) => ({
          code: `P${index + 1}`,
          date: tournament.date?.toISOString().split('T')[0] || null,
          start: "TBD",
          end: "TBD",
          round: "Registration",
          players: reg.playerName
        })),
      prizes: ["Winner Trophy", "Runner-up Trophy"],
      // Add progression data for completed tournaments
      progression: tournament.status === 'COMPLETED' ? {
        currentRound: tournament.currentRound,
        rounds: tournament.rounds.map(round => ({
          id: round.id,
          name: round.name,
          order: round.order,
          maxMatches: round.maxMatches,
          isCompleted: round.isCompleted,
          completedAt: round.completedAt?.toISOString() || null,
          matches: round.matches.map(match => ({
            id: match.id,
            matchCode: match.matchCode,
            player1: match.player1,
            player2: match.player2,
            winner: match.winner,
            score: match.score,
            isCompleted: match.isCompleted,
            scheduledAt: match.scheduledAt?.toISOString() || null,
            completedAt: match.completedAt?.toISOString() || null,
            courtNumber: match.courtNumber
          }))
        }))
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      tournament: transformedTournament 
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}
