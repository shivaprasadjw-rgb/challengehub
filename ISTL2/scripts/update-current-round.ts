import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCurrentRound() {
  try {
    console.log('🔄 Updating tournament current round...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Update tournament currentRound to Round of 16
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentRound: 'Round of 16'
      }
    });
    
    console.log('✅ Tournament currentRound updated to "Round of 16"');
    console.log('🎯 Advance to Next Round button should now be visible');
    
  } catch (error) {
    console.error('💥 Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCurrentRound();
