import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMatchStatusesCorrect() {
  try {
    console.log('🔧 Fixing match completion statuses for Round of 32...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get Round of 32 matches
    const round32 = await prisma.tournamentRound.findFirst({
      where: { 
        tournamentId: tournamentId,
        name: 'Round of 32'
      }
    });
    
    if (!round32) {
      console.log('❌ Round of 32 not found');
      return;
    }
    
    const matches = await prisma.match.findMany({
      where: { roundId: round32.id }
    });
    
    console.log(`🏓 Found ${matches.length} matches in Round of 32`);
    
    // Fix each match completion status using the correct field
    for (const match of matches) {
      if (!match.isCompleted) {
        await prisma.match.update({
          where: { id: match.id },
          data: { 
            isCompleted: true,
            completedAt: new Date()
          }
        });
        console.log(`✅ Fixed match: ${match.player1 || 'Player 1'} vs ${match.player2 || 'Player 2'}`);
      }
    }
    
    // Verify all matches are now completed
    const updatedMatches = await prisma.match.findMany({
      where: { roundId: round32.id }
    });
    
    const completedCount = updatedMatches.filter(m => m.isCompleted).length;
    console.log(`\n🎉 Status fix complete!`);
    console.log(`✅ ${completedCount}/${updatedMatches.length} matches now marked as completed`);
    
    if (completedCount === updatedMatches.length) {
      console.log('�� Round of 32 is now properly completed!');
      console.log('🔄 Tournament progression should work now');
      console.log('⏭️ "Advance to Next Round" button should appear');
      
      // Also update the round completion status
      await prisma.tournamentRound.update({
        where: { id: round32.id },
        data: { 
          isCompleted: true,
          completedAt: new Date()
        }
      });
      console.log('✅ Round of 32 status updated to completed');
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMatchStatusesCorrect();