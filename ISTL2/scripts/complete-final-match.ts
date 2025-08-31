import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeFinalMatch() {
  try {
    console.log('🏆 Completing Final match...');
    
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
    
    // Get Final match
    const finalMatch = await prisma.match.findFirst({
      where: { roundId: finalRound.id }
    });
    
    if (!finalMatch) {
      console.log('❌ Final match not found');
      return;
    }
    
    console.log(`📋 Final Match: ${finalMatch.matchCode}`);
    console.log(`   - Player 1: ${finalMatch.player1}`);
    console.log(`   - Player 2: ${finalMatch.player2}`);
    console.log(`   - Current Status: ${finalMatch.isCompleted ? 'Completed' : 'Not Completed'}`);
    
    // Complete the Final match (assuming Sanjay Yadav wins based on the image)
    await prisma.match.update({
      where: { id: finalMatch.id },
      data: {
        winner: finalMatch.player1, // Sanjay Yadav
        score: '21-15',
        isCompleted: true,
        completedAt: new Date()
      }
    });
    
    console.log('✅ Final match completed');
    console.log(`   - Winner: ${finalMatch.player1}`);
    console.log(`   - Score: 21-15`);
    
    // Mark Final round as completed
    await prisma.tournamentRound.update({
      where: { id: finalRound.id },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });
    
    console.log('✅ Final round marked as completed');
    
    // Update tournament status to COMPLETED
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        currentRound: 'Final'
      }
    });
    
    console.log('✅ Tournament status updated to COMPLETED');
    console.log('🎉 Tournament completed successfully!');
    
  } catch (error) {
    console.error('💥 Completion failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeFinalMatch();
