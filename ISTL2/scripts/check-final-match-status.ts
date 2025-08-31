import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFinalMatchStatus() {
  try {
    console.log('🔍 Checking Final match status...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get Final round
    const finalRound = await prisma.tournamentRound.findFirst({
      where: { 
        tournamentId: tournamentId,
        name: 'Final'
      }
    });
    
    if (!finalRound) {
      console.log('❌ Final round not found');
      return;
    }
    
    console.log(`📋 Final Round:`);
    console.log(`   - ID: ${finalRound.id}`);
    console.log(`   - Name: ${finalRound.name}`);
    console.log(`   - Order: ${finalRound.order}`);
    console.log(`   - Is Completed: ${finalRound.isCompleted}`);
    
    // Get Final matches
    const finalMatches = await prisma.match.findMany({
      where: { roundId: finalRound.id }
    });
    
    console.log(`\n🏓 Final Matches:`);
    console.log(`   - Total: ${finalMatches.length}`);
    
    for (const match of finalMatches) {
      console.log(`\n📋 Match: ${match.matchCode}`);
      console.log(`   - Player 1: ${match.player1}`);
      console.log(`   - Player 2: ${match.player2}`);
      console.log(`   - Winner: ${match.winner}`);
      console.log(`   - Score: ${match.score}`);
      console.log(`   - Is Completed: ${match.isCompleted}`);
      console.log(`   - Scheduled At: ${match.scheduledAt}`);
      console.log(`   - Completed At: ${match.completedAt}`);
      
      if (!match.isCompleted && match.player1 && match.player2) {
        console.log('   ✅ Match is ready for completion - should be clickable');
      } else if (match.isCompleted) {
        console.log('   ✅ Match is already completed');
      } else {
        console.log('   ❌ Match is not ready for completion');
      }
    }
    
    // Check if tournament should be marked as completed
    const allRounds = await prisma.tournamentRound.findMany({
      where: { tournamentId: tournamentId },
      orderBy: { order: 'asc' }
    });
    
    const allMatches = await prisma.match.findMany({
      where: { tournamentId: tournamentId }
    });
    
    const completedMatches = allMatches.filter(m => m.isCompleted);
    const completedRounds = allRounds.filter(r => r.isCompleted);
    
    console.log(`\n🏆 Tournament Completion Status:`);
    console.log(`   - Total Rounds: ${allRounds.length}`);
    console.log(`   - Completed Rounds: ${completedRounds.length}`);
    console.log(`   - Total Matches: ${allMatches.length}`);
    console.log(`   - Completed Matches: ${completedMatches.length}`);
    
    if (completedMatches.length === allMatches.length && allMatches.length > 0) {
      console.log('   ✅ All matches completed - tournament should be marked as COMPLETED');
      
      // Update tournament status to COMPLETED
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { 
          status: 'COMPLETED',
          currentRound: 'Final'
        }
      });
      
      console.log('   ✅ Tournament status updated to COMPLETED');
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalMatchStatus();
