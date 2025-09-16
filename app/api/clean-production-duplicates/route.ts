import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🧹 Starting production database cleanup...');

    // 1. Clean duplicate tournaments
    console.log('📝 Cleaning duplicate tournaments...');
    
    const duplicateTournaments = await prisma.$queryRaw`
      SELECT title, date, COUNT(*) as count
      FROM tournaments 
      GROUP BY title, date 
      HAVING COUNT(*) > 1
    `;
    
    let deletedTournaments = 0;
    for (const duplicate of duplicateTournaments as any[]) {
      const tournaments = await prisma.tournament.findMany({
        where: {
          title: duplicate.title,
          date: duplicate.date
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const toDelete = tournaments.slice(1);
      for (const tournament of toDelete) {
        await prisma.tournament.delete({
          where: { id: tournament.id }
        });
        deletedTournaments++;
      }
    }

    // 2. Clean duplicate organizers
    console.log('📝 Cleaning duplicate organizers...');
    
    const duplicateOrganizers = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM organizers 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `;

    let deletedOrganizers = 0;
    for (const duplicate of duplicateOrganizers as any[]) {
      const organizers = await prisma.organizer.findMany({
        where: { name: duplicate.name },
        orderBy: { createdAt: 'asc' }
      });

      const toDelete = organizers.slice(1);
      for (const organizer of toDelete) {
        await prisma.organizer.delete({
          where: { id: organizer.id }
        });
        deletedOrganizers++;
      }
    }

    // 3. Clean duplicate venues
    console.log('📝 Cleaning duplicate venues...');
    
    const duplicateVenues = await prisma.$queryRaw`
      SELECT name, "organizerId", COUNT(*) as count
      FROM venues 
      GROUP BY name, "organizerId"
      HAVING COUNT(*) > 1
    `;

    let deletedVenues = 0;
    for (const duplicate of duplicateVenues as any[]) {
      const venues = await prisma.venue.findMany({
        where: { 
          name: duplicate.name,
          organizerId: duplicate.organizerId
        },
        orderBy: { createdAt: 'asc' }
      });

      const toDelete = venues.slice(1);
      for (const venue of toDelete) {
        await prisma.venue.delete({
          where: { id: venue.id }
        });
        deletedVenues++;
      }
    }

    // 4. Clean duplicate registrations
    console.log('📝 Cleaning duplicate registrations...');
    
    const duplicateRegistrations = await prisma.$queryRaw`
      SELECT "playerEmail", "tournamentId", COUNT(*) as count
      FROM registrations 
      GROUP BY "playerEmail", "tournamentId"
      HAVING COUNT(*) > 1
    `;

    let deletedRegistrations = 0;
    for (const duplicate of duplicateRegistrations as any[]) {
      const registrations = await prisma.registration.findMany({
        where: { 
          playerEmail: duplicate.playerEmail,
          tournamentId: duplicate.tournamentId
        },
        orderBy: { registeredAt: 'asc' }
      });

      const toDelete = registrations.slice(1);
      for (const registration of toDelete) {
        await prisma.registration.delete({
          where: { id: registration.id }
        });
        deletedRegistrations++;
      }
    }

    console.log('✅ Production database cleanup completed!');

    // Get final counts
    const counts = await Promise.all([
      prisma.tournament.count(),
      prisma.organizer.count(),
      prisma.venue.count(),
      prisma.registration.count()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Production database cleanup completed',
      deleted: {
        tournaments: deletedTournaments,
        organizers: deletedOrganizers,
        venues: deletedVenues,
        registrations: deletedRegistrations
      },
      finalCounts: {
        tournaments: counts[0],
        organizers: counts[1],
        venues: counts[2],
        registrations: counts[3]
      }
    });

  } catch (error) {
    console.error('❌ Error during production cleanup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clean production database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to clean production database duplicates",
    endpoint: "/api/clean-production-duplicates",
    method: "POST",
    warning: "This will delete duplicate data from production database"
  });
}
