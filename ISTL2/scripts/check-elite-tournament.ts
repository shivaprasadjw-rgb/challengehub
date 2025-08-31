import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEliteTournament() {
  try {
    console.log('🔍 Checking Elite Sports Academy tournament...');
    
    // Find the tournament
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: 'cmezopf6n001aixc0rbqbakb4'
      },
      include: {
        organizer: true,
        venue: true,
        registrations: true,
        rounds: true
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found!');
      return;
    }
    
    console.log('\n📊 Tournament Details:');
    console.log(`🏆 Title: ${tournament.title}`);
    console.log(`🆔 ID: ${tournament.id}`);
    console.log(`📅 Date: ${tournament.date}`);
    console.log(`📊 Status: ${tournament.status}`);
    console.log(`👥 Max Participants: ${tournament.maxParticipants}`);
    console.log(`💰 Entry Fee: ${tournament.entryFee}`);
    console.log(`🏢 Organizer: ${tournament.organizer.name} (${tournament.organizer.slug})`);
    console.log(`📍 Venue: ${tournament.venue?.name}`);
    console.log(`📝 Registrations: ${tournament.registrations.length}`);
    console.log(`🏟️ Rounds: ${tournament.rounds.length}`);
    
    console.log('\n👥 Current Registration Details:');
    tournament.registrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.playerName} (${reg.playerEmail}) - ${reg.playerCategory}`);
    });
    
    console.log('\n🔗 Access URLs:');
    console.log(`Organizer Dashboard: http://localhost:3000/organizer/${tournament.organizer.slug}/dashboard`);
    console.log(`Tournament List: http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments`);
    console.log(`Tournament Detail: http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments/${tournament.id}`);
    
  } catch (error) {
    console.error('💥 Error checking tournament:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEliteTournament();
