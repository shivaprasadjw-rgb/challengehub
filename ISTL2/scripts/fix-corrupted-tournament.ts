import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCorruptedTournament() {
  try {
    console.log('🔧 Fixing corrupted tournament state...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Step 1: Reset tournament to DRAFT status
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { 
        status: 'DRAFT',
        currentRound: null,
        progressionData: null
      }
    });
    console.log('✅ Tournament reset to DRAFT status');
    
    // Step 2: Delete all corrupted rounds and matches
    const deletedMatches = await prisma.match.deleteMany({
      where: { tournamentId: tournamentId }
    });
    console.log(`��️ Deleted ${deletedMatches.count} corrupted matches`);
    
    const deletedRounds = await prisma.tournamentRound.deleteMany({
      where: { tournamentId: tournamentId }
    });
    console.log(`��️ Deleted ${deletedRounds.count} corrupted rounds`);
    
    // Step 3: Verify clean state
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rounds: true,
        matches: true,
        registrations: true
      }
    });
    
    console.log('\n🎉 Tournament fixed!');
    console.log(`🏆 Title: ${tournament?.title}`);
    console.log(`📊 Status: ${tournament?.status}`);
    console.log(`👥 Registrations: ${tournament?.registrations.length}`);
    console.log(`📋 Rounds: ${tournament?.rounds.length}`);
    console.log(`🏓 Matches: ${tournament?.matches.length}`);
    
    console.log('\n Next steps:');
    console.log('1. Go to tournament page');
    console.log('2. Click "Initialize Tournament"');
    console.log('3. Tournament progression should work properly now');
    console.log(`🔗 URL: http://localhost:3000/organizer/elite-sports-academy/tournaments/${tournamentId}`);
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCorruptedTournament();