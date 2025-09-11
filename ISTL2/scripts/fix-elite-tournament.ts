import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEliteTournament() {
  try {
    console.log('🔧 Fixing Elite Tennis Championship tournament...');

    // Find the tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        title: 'Elite Tennis Championship 2024'
      },
      include: {
        rounds: true,
        matches: true
      }
    });

    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }

    console.log('✅ Found tournament:', tournament.title);
    console.log('📋 Current rounds:', tournament.rounds?.length || 0);
    console.log('�� Current matches:', tournament.matches?.length || 0);

    // Clear existing progression data
    console.log('\n��️ Clearing existing progression data...');
    
    await prisma.match.deleteMany({
      where: { tournamentId: tournament.id }
    });
    console.log('✅ Deleted existing matches');

    await prisma.tournamentRound.deleteMany({
      where: { tournamentId: tournament.id }
    });
    console.log('✅ Deleted existing rounds');

    // Reset tournament status
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        currentRound: null,
        status: 'DRAFT'
      }
    });
    console.log('✅ Reset tournament status to DRAFT');

    console.log('\n🎉 Tournament progression data cleared!');
    console.log(' Now try clicking "Initialize Tournament" again');
    console.log(' It should work without the "Failed to initialize" error');

  } catch (error) {
    console.error('❌ Error fixing tournament:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEliteTournament()
  .then(() => {
    console.log('\n✨ Fix completed!');
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });