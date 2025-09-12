import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateData() {
  try {
    console.log('🧹 Starting duplicate data cleanup...');

    // 1. Clean duplicate tournaments
    console.log('📝 Cleaning duplicate tournaments...');
    
    // Find duplicates by title and date
    const duplicateTournaments = await prisma.$queryRaw`
      SELECT title, date, COUNT(*) as count
      FROM tournaments 
      GROUP BY title, date 
      HAVING COUNT(*) > 1
    `;
    
    console.log('Found duplicate tournaments:', duplicateTournaments);

    // Keep the first occurrence, delete the rest
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

      // Keep the first one, delete the rest
      const toDelete = tournaments.slice(1);
      for (const tournament of toDelete) {
        await prisma.tournament.delete({
          where: { id: tournament.id }
        });
        console.log(`🗑️ Deleted duplicate tournament: ${tournament.title}`);
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
        console.log(`🗑️ Deleted duplicate organizer: ${organizer.name}`);
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
        console.log(`🗑️ Deleted duplicate venue: ${venue.name}`);
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
        console.log(`🗑️ Deleted duplicate registration: ${registration.playerEmail}`);
      }
    }

    console.log('✅ Duplicate data cleanup completed!');

    // Show final counts
    const counts = await Promise.all([
      prisma.tournament.count(),
      prisma.organizer.count(),
      prisma.venue.count(),
      prisma.registration.count()
    ]);

    console.log('📊 Final counts:');
    console.log(`- Tournaments: ${counts[0]}`);
    console.log(`- Organizers: ${counts[1]}`);
    console.log(`- Venues: ${counts[2]}`);
    console.log(`- Registrations: ${counts[3]}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateData();
