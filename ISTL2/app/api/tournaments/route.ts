import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        organizer: true,
        venue: true,
        registrations: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform Prisma data to match the expected format
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      name: tournament.title,
      date: tournament.date?.toISOString().split('T')[0] || null,
      status: tournament.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
      sport: tournament.sport,
      format: 'Singles', // format field doesn't exist in schema
      category: 'Open Category', // category field doesn't exist in schema
      entryFee: tournament.entryFee,
      registrationDeadline: null, // registrationDeadline field doesn't exist in schema
      maxParticipants: tournament.maxParticipants,
      currentParticipants: tournament.registrations.length,
      organizer: {
        name: tournament.organizer.name,
        phone: (tournament.organizer.contact as any)?.phone || null,
        email: (tournament.organizer.contact as any)?.email || null
      },
      venue: tournament.venue ? {
        id: tournament.venue.id,
        name: tournament.venue.name,
        locality: tournament.venue.locality,
        city: tournament.venue.city,
        state: tournament.venue.state,
        pincode: tournament.venue.pincode,
        address: tournament.venue.address
      } : null,
      schedule: [],
      prizes: [] // prizePool field doesn't exist in schema
    }));

    return NextResponse.json({ success: true, tournaments: transformedTournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ success: false, error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
