import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTournamentStatus() {
  try {
    console.log('🔍 Verifying tournament and registration status...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Check tournament status
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: true,
        rounds: true,
        matches: true
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }
    
    console.log('\n�� Tournament Details:');
    console.log(`Title: ${tournament.title}`);
    console.log(`Status: ${tournament.status}`);
    console.log(`Max Participants: ${tournament.maxParticipants}`);
    console.log(`Registrations: ${tournament.registrations.length}`);
    console.log(`Rounds: ${tournament.rounds.length}`);
    console.log(`Matches: ${tournament.matches.length}`);
    
    if (tournament.registrations.length > 0) {
      console.log('\n👥 Sample Registrations:');
      tournament.registrations.slice(0, 5).forEach((reg, index) => {
        console.log(`${index + 1}. ${reg.playerName} (${reg.playerEmail}) - ${reg.playerAge} years, ${reg.playerGender}`);
      });
      
      if (tournament.registrations.length > 5) {
        console.log(`... and ${tournament.registrations.length - 5} more`);
      }
    }
    
    console.log('\n🎯 Current Status:');
    if (tournament.registrations.length >= 32) {
      console.log('✅ Ready for tournament initialization');
      console.log('✅ 32+ participants registered');
      console.log('🔗 Go to: http://localhost:3000/organizer/elite-sports-academy/tournaments/' + tournamentId);
    } else {
      console.log('❌ Not enough participants for 32-player tournament');
      console.log(`❌ Need: 32, Have: ${tournament.registrations.length}`);
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTournamentStatus();