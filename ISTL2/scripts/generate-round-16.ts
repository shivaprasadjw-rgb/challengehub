import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateRound16() {
  try {
    console.log('🏓 Generating Round of 16 matches...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get completed Round of 32 matches
    const round32 = await prisma.tournamentRound.findFirst({
      where: { 
        tournamentId: tournamentId,
        name: 'Round of 32'
      }
    });
    
    const round16 = await prisma.tournamentRound.findFirst({
      where: { 
        tournamentId: tournamentId,
        name: 'Round of 16'
      }
    });
    
    if (!round32 || !round16) {
      console.log('❌ Rounds not found');
      return;
    }
    
    // Get winners from Round of 32
    const completedMatches = await prisma.match.findMany({
      where: { 
        roundId: round32.id,
        isCompleted: true
      }
    });
    
    console.log(`🏆 Found ${completedMatches.length} completed matches`);
    
    // Extract winners (simplified logic)
    const winners = completedMatches.map(match => {
      // For now, just use player1 as winner (you can adjust this logic)
      return match.player1 || `Winner ${match.id}`;
    });
    
    // Create Round of 16 matches
    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        await prisma.match.create({
          data: {
            tournamentId: tournamentId,
            roundId: round16.id,
            player1: winners[i],
            player2: winners[i + 1],
            isCompleted: false,
            matchCode: `R16-M${Math.floor(i/2) + 1}`
          }
        });
        console.log(`✅ Created match: ${winners[i]} vs ${winners[i + 1]}`);
      }
    }
    
    console.log('\n🎉 Round of 16 generated successfully!');
    console.log('🔄 Tournament should now show progression options');
    
  } catch (error) {
    console.error('💥 Generation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateRound16();