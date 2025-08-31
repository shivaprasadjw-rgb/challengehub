import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTournamentProgression() {
  try {
    console.log('🔍 Debugging tournament progression...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get tournament with all related data
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rounds: {
          orderBy: { roundNumber: 'asc' }
        },
        matches: {
          include: {
            round: true
          },
          orderBy: { matchNumber: 'asc' }
        },
        registrations: true
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }
    
    console.log('\n�� Tournament Details:');
    console.log(`Title: ${tournament.title}`);
    console.log(`Status: ${tournament.status}`);
    console.log(`Current Round: ${tournament.currentRound || 'Not set'}`);
    console.log(`Registrations: ${tournament.registrations.length}`);
    
    console.log('\n📊 Rounds:');
    tournament.rounds.forEach(round => {
      console.log(`Round ${round.roundNumber}: ${round.name} - ${round.status}`);
    });
    
    console.log('\n🏓 Matches:');
    tournament.matches.forEach(match => {
      console.log(`Match ${match.matchNumber}: ${match.player1Name} vs ${match.player2Name} - ${match.status} - Round: ${match.round.name}`);
    });
    
    // Check if all matches in current round are completed
    const currentRound = tournament.rounds.find(r => r.status === 'IN_PROGRESS');
    if (currentRound) {
      const roundMatches = tournament.matches.filter(m => m.roundId === currentRound.id);
      const completedMatches = roundMatches.filter(m => m.status === 'COMPLETED');
      
      console.log(`\n🎯 Current Round Analysis:`);
      console.log(`Round: ${currentRound.name}`);
      console.log(`Total Matches: ${roundMatches.length}`);
      console.log(`Completed Matches: ${completedMatches.length}`);
      console.log(`All Completed: ${roundMatches.length === completedMatches.length}`);
      
      if (roundMatches.length === completedMatches.length) {
        console.log('✅ All matches completed - should show "Advance to Next Round" button');
      } else {
        console.log('❌ Some matches not completed - check match statuses');
      }
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTournamentProgression();