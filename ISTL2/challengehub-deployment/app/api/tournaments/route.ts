import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First try with Prisma ORM
    let tournaments;
    try {
      tournaments = await prisma.tournament.findMany({
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
    } catch (enumError) {
      console.log('⚠️ Prisma enum error, falling back to raw SQL:', enumError);
      
      // Fallback to raw SQL if enum issue occurs
      const rawTournaments = await prisma.$queryRaw`
        SELECT 
          t.id, t.title, t.sport, t.date, t."entryFee", t."maxParticipants", 
          t.status, t."venueId", t."currentRound", t."progressionData",
          t."createdAt", t."updatedAt",
          o.name as organizer_name, o.contact as organizer_contact,
          v.name as venue_name, v.locality, v.city, v.state, v.pincode, v.address,
          COUNT(r.id) as registration_count
        FROM tournaments t
        LEFT JOIN organizers o ON t."organizerId" = o.id
        LEFT JOIN venues v ON t."venueId" = v.id
        LEFT JOIN registrations r ON t.id = r."tournamentId"
        WHERE t.status IN ('ACTIVE', 'COMPLETED')
        GROUP BY t.id, o.id, v.id
        ORDER BY t."createdAt" DESC
      `;
      
      // Transform raw data to match Prisma format
      tournaments = (rawTournaments as any[]).map(row => ({
        id: row.id,
        title: row.title,
        sport: row.sport,
        date: row.date,
        entryFee: row.entryFee,
        maxParticipants: row.maxParticipants,
        status: row.status,
        venueId: row.venueId,
        currentRound: row.currentRound,
        progressionData: row.progressionData,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        organizer: {
          name: row.organizer_name,
          contact: row.organizer_contact
        },
        venue: row.venue_name ? {
          id: row.venueId,
          name: row.venue_name,
          locality: row.locality,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          address: row.address
        } : null,
        registrations: Array.from({ length: parseInt(row.registration_count) }, (_, i) => ({ id: `${row.id}-${i}` }))
      }));
    }

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
