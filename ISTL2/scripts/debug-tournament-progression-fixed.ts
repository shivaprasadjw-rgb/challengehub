import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTournamentProgressionFixed() {
  try {
    console.log('🔍 Debugging tournament progression...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get tournament with all related data using correct fields
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rounds: {
          orderBy: { order: 'asc' } // Use 'order' field instead of 'roundNumber'
        },
        matches: {
          include: {
            round: true
          },
          orderBy: { id: 'asc' } // Use 'id' instead of 'matchNumber'
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
      console.log(`Round ${round.order}: ${round.name} - Status: ${round.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}`);
    });
    
    console.log('\n🏓 Matches:');
    tournament.matches.forEach(match => {
      console.log(`Match ${match.id}: ${match.player1Name} vs ${match.player2Name} - ${match.status} - Round: ${match.round.name}`);
    });
    
    // Check if all matches in current round are completed
    const currentRound = tournament.rounds.find(r => !r.isCompleted);
    if (currentRound) {
      const roundMatches = tournament.matches.filter(m => m.roundId === currentRound.id);
      const completedMatches = roundMatches.filter(m => m.status === 'COMPLETED');
      
      console.log(`\n🎯 Current Round Analysis:`);
      console.log(`Round: ${currentRound.name} (Order: ${currentRound.order})`);
      console.log(`Total Matches: ${roundMatches.length}`);
      console.log(`Completed Matches: ${completedMatches.length}`);
      console.log(`All Completed: ${roundMatches.length === completedMatches.length}`);
      
      if (roundMatches.length === completedMatches.length) {
        console.log('✅ All matches completed - should show "Advance to Next Round" button');
      } else {
        console.log('❌ Some matches not completed - check match statuses');
      }
    }
    
    console.log('\n�� Progression Issues Check:');
    console.log('1. Are all matches in Round of 32 marked as COMPLETED?');
    console.log('2. Is the round status properly updated?');
    console.log('3. Is the tournament progression logic working?');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTournamentProgressionFixed();