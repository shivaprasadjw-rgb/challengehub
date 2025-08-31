import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTournamentStatus() {
  try {
    console.log('🔍 Checking tournament status...');
    
    // Find the tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        title: 'Mumbai Badminton Championship 2025'
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
    
    console.log('\n👥 Registration Details:');
    tournament.registrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.playerName} (${reg.playerEmail}) - ${reg.playerCategory}`);
    });
    
    console.log('\n🔗 Access URLs:');
    console.log(`Organizer Dashboard: http://localhost:3000/organizer/${tournament.organizer.slug}/dashboard`);
    console.log(`Tournament List: http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments`);
    console.log(`Tournament Detail: http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments/${tournament.id}`);
    
    // Check if organizer user exists and has proper access
    const organizerUser = await prisma.user.findUnique({
      where: { email: 'neworganizer@example.com' },
      include: {
        organizerMemberships: {
          include: {
            organizer: true
          }
        }
      }
    });
    
    if (organizerUser) {
      console.log('\n👤 Organizer User Details:');
      console.log(`Email: ${organizerUser.email}`);
      console.log(`Name: ${organizerUser.name}`);
      console.log(`Role: ${organizerUser.role}`);
      console.log(`Status: ${organizerUser.status}`);
      console.log(`Memberships: ${organizerUser.organizerMemberships.length}`);
      
      organizerUser.organizerMemberships.forEach(membership => {
        console.log(`  - ${membership.organizer.name} (${membership.role})`);
      });
    } else {
      console.log('\n❌ Organizer user not found!');
    }
    
  } catch (error) {
    console.error('💥 Error checking tournament:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTournamentStatus();
