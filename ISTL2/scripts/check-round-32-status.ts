import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRound32Status() {
  try {
    console.log('🔍 Checking Round of 32 status...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get Round of 32
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
    
    console.log(`📋 Round of 32:`);
    console.log(`   - ID: ${round32.id}`);
    console.log(`   - Name: ${round32.name}`);
    console.log(`   - Order: ${round32.order}`);
    console.log(`   - Is Completed: ${round32.isCompleted}`);
    console.log(`   - Max Matches: ${round32.maxMatches}`);
    
    // Get matches for Round of 32
    const matches = await prisma.match.findMany({
      where: { roundId: round32.id }
    });
    
    const completedMatches = matches.filter(m => m.isCompleted);
    
    console.log(`\n🏓 Matches:`);
    console.log(`   - Total: ${matches.length}`);
    console.log(`   - Completed: ${completedMatches.length}`);
    
    // Check if all matches are completed but round is not marked as completed
    if (completedMatches.length === matches.length && matches.length > 0 && !round32.isCompleted) {
      console.log('\n✅ All matches completed but round not marked as completed');
      console.log('🎯 This is why the Advance button should show');
    } else if (round32.isCompleted) {
      console.log('\n❌ Round is marked as completed - this prevents the Advance button from showing');
      console.log('🔧 Need to set isCompleted to false');
      
      // Fix: Set isCompleted to false
      await prisma.tournamentRound.update({
        where: { id: round32.id },
        data: { isCompleted: false }
      });
      
      console.log('✅ Fixed: Round of 32 isCompleted set to false');
      console.log('🎯 Advance to Next Round button should now be visible');
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRound32Status();
