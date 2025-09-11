import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function advanceTournamentRound() {
  try {
    console.log('�� Manually advancing tournament to next round...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get current tournament state
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rounds: {
          orderBy: { order: 'asc' }
        },
        matches: {
          include: { round: true }
        }
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }
    
    console.log(`�� Tournament: ${tournament.title}`);
    console.log(`📊 Status: ${tournament.status}`);
    console.log(`🔄 Current Round: ${tournament.currentRound}`);
    
    // Find the next round to generate
    const currentRound = tournament.rounds.find(r => r.name === 'Round of 32');
    const nextRound = tournament.rounds.find(r => r.name === 'Round of 16');
    
    if (!currentRound || !nextRound) {
      console.log('❌ Round structure not found');
      return;
    }
    
    console.log(`🎯 Current Round: ${currentRound.name} (${currentRound.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'})`);
    console.log(`⏭️ Next Round: ${nextRound.name} (${nextRound.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'})`);
    
    // Check if Round of 32 is truly completed
    const round32Matches = tournament.matches.filter(m => m.roundId === currentRound.id);
    const completedMatches = round32Matches.filter(m => m.isCompleted);
    
    console.log(`🏓 Round of 32 Matches: ${round32Matches.length} total, ${completedMatches.length} completed`);
    
    if (completedMatches.length === round32Matches.length) {
      console.log('✅ Round of 32 is fully completed - proceeding to generate Round of 16');
      
      // Generate matches for Round of 16
      const winners = completedMatches.map(match => {
        // Use winner field directly
        return match.winner;
      }).filter(Boolean);
      
      console.log(`�� Winners from Round of 32: ${winners.length}`);
      winners.forEach((winner, index) => {
        console.log(`  ${index + 1}. ${winner}`);
      });
      
      // Create 8 matches for Round of 16
      const round16Matches = [];
      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          const match = await prisma.match.create({
            data: {
              tournamentId: tournamentId,
              roundId: nextRound.id,
              player1: winners[i],
              player2: winners[i + 1],
              matchCode: `R16-M${Math.floor(i/2) + 1}`,
              isCompleted: false
            }
          });
          round16Matches.push(match);
          console.log(`✅ Created match: ${winners[i]} vs ${winners[i + 1]}`);
        }
      }
      
      // Update tournament current round
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { currentRound: 'Round of 16' }
      });
      
      console.log('\n🎉 Round of 16 generated successfully!');
      console.log(`🏓 Created ${round16Matches.length} matches`);
      console.log(`�� Tournament current round: Round of 16`);
      
    } else {
      console.log('❌ Round of 32 is not fully completed');
    }
    
  } catch (error) {
    console.error('�� Advancement failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

advanceTournamentRound();