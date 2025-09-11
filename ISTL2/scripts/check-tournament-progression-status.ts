import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTournamentProgressionStatus() {
  try {
    console.log('🔍 Checking tournament progression status...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get tournament details
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rounds: {
          orderBy: { order: 'asc' }
        },
        matches: {
          include: {
            round: true
          },
          orderBy: { id: 'asc' }
        }
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }
    
    console.log(`\n🏆 Tournament: ${tournament.title}`);
    console.log(`📊 Status: ${tournament.status}`);
    console.log(`🔄 Current Round: ${tournament.currentRound}`);
    console.log(`📈 Total Rounds: ${tournament.rounds.length}`);
    console.log(`🏓 Total Matches: ${tournament.matches.length}`);
    
    // Check each round
    for (const round of tournament.rounds) {
      const roundMatches = tournament.matches.filter(m => m.roundId === round.id);
      const completedMatches = roundMatches.filter(m => m.isCompleted);
      
      console.log(`\n📋 ${round.name} (Order: ${round.order}):`);
      console.log(`   - Status: ${round.isCompleted ? '✅ Completed' : '🔄 In Progress'}`);
      console.log(`   - Matches: ${completedMatches.length}/${roundMatches.length} completed`);
      console.log(`   - Max Matches: ${round.maxMatches}`);
      
      if (roundMatches.length > 0) {
        console.log(`   - First match: ${roundMatches[0].matchCode} (${roundMatches[0].player1} vs ${roundMatches[0].player2})`);
      }
    }
    
    // Check if current round is completed
    const currentRound = tournament.rounds.find(r => r.name === tournament.currentRound);
    if (currentRound) {
      const currentRoundMatches = tournament.matches.filter(m => m.roundId === currentRound.id);
      const currentRoundCompleted = currentRoundMatches.filter(m => m.isCompleted);
      
      console.log(`\n🎯 Current Round Analysis:`);
      console.log(`   - Round: ${currentRound.name}`);
      console.log(`   - Matches: ${currentRoundCompleted.length}/${currentRoundMatches.length} completed`);
      console.log(`   - Is Round Completed: ${currentRound.isCompleted}`);
      
      if (currentRoundCompleted.length === currentRoundMatches.length && currentRoundMatches.length > 0) {
        console.log(`   ✅ Round is fully completed - Advance button should be visible`);
      } else {
        console.log(`   ❌ Round is not fully completed - Advance button will be hidden`);
      }
    }
    
    // Check next round availability
    const nextRound = tournament.rounds.find(r => r.order === (currentRound?.order || 0) + 1);
    if (nextRound) {
      console.log(`\n🔮 Next Round Available: ${nextRound.name}`);
    } else {
      console.log(`\n🏁 No next round available - Tournament complete`);
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTournamentProgressionStatus();
