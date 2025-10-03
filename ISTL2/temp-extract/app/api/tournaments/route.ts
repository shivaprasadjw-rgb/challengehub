import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Fetching tournaments...');
    
    // First, let's see all tournaments without any filters
    const allTournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log('📊 All tournaments in database:', allTournaments);
    
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
    
    console.log('🎯 Filtered tournaments:', tournaments.length);

    // Transform Prisma data to match the expected format
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      name: tournament.title,
      date: tournament.date?.toISOString().split('T')[0] || null,
      status: tournament.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
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
      schedule: [],
      prizes: []
    }));

    return NextResponse.json({ success: true, tournaments: transformedTournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    
    // Check if it's a database schema error (enum types don't exist)
    if (error instanceof Error && (
      error.message.includes('operator does not exist') ||
      error.message.includes('type') && error.message.includes('does not exist')
    )) {
      console.log('Database schema not set up yet, returning empty tournaments list');
      return NextResponse.json({ success: true, tournaments: [] });
    }
    
    return NextResponse.json({ success: false, error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
