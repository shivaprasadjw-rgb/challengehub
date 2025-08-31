import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTournamentInitialization() {
  try {
    console.log('🔍 Debugging tournament initialization...');

    // Find the Elite Tennis Championship tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        title: 'Elite Tennis Championship 2024'
      },
      include: {
        registrations: true,
        rounds: true,
        matches: true
      }
    });

    if (!tournament) {
      console.log('❌ Tournament not found');
      return;
    }

    console.log('✅ Found tournament:', tournament.title);
    console.log('📋 Tournament ID:', tournament.id);
    console.log('📊 Status:', tournament.status);
    console.log('👥 Registrations:', tournament.registrations.length);
    console.log('🏆 Rounds:', tournament.rounds.length);
    console.log('⚽ Matches:', tournament.matches.length);

    // Check if tournament has registrations
    if (tournament.registrations.length === 0) {
      console.log('❌ No registrations found - this is the problem!');
      return;
    }

    console.log('\n👥 REGISTRATION DETAILS:');
    tournament.registrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.playerName} (${reg.playerEmail})`);
    });

    // Test the initialization logic step by step
    console.log('\n🧪 TESTING INITIALIZATION LOGIC:');
    
    const participantCount = tournament.registrations.length;
    let firstRoundName = 'Round of 16';
    let firstRoundMatches = 8;
    
    if (participantCount > 16) {
      firstRoundName = 'Round of 32';
      firstRoundMatches = 16;
    } else if (participantCount > 8) {
      firstRoundName = 'Round of 16';
      firstRoundMatches = 8;
    } else if (participantCount > 4) {
      firstRoundName = 'Quarterfinal';
      firstRoundMatches = 4;
    } else if (participantCount > 2) {
      firstRoundName = 'Semifinal';
      firstRoundMatches = 2;
    }

    console.log(`�� Participant count: ${participantCount}`);
    console.log(`🏆 First round: ${firstRoundName}`);
    console.log(`⚽ First round matches: ${firstRoundMatches}`);

    // Test creating rounds
    console.log('\n🔧 TESTING ROUND CREATION:');
    try {
      const testRound = await prisma.tournamentRound.create({
        data: {
          tournamentId: tournament.id,
          name: 'Test Round',
          order: 999,
          maxMatches: 1
        }
      });
      console.log('✅ Test round created successfully');
      
      // Clean up test round
      await prisma.tournamentRound.delete({
        where: { id: testRound.id }
      });
      console.log('🗑️ Test round cleaned up');
    } catch (error) {
      console.error('❌ Failed to create test round:', error);
    }

    // Test creating matches
    console.log('\n🔧 TESTING MATCH CREATION:');
    try {
      const testMatch = await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          roundId: tournament.rounds[0]?.id || 'test',
          matchCode: 'TEST-M01',
          player1: 'Test Player 1',
          player2: 'Test Player 2'
        }
      });
      console.log('✅ Test match created successfully');
      
      // Clean up test match
      await prisma.match.delete({
        where: { id: testMatch.id }
      });
      console.log('🗑️ Test match cleaned up');
    } catch (error) {
      console.error('❌ Failed to create test match:', error);
    }

    // Test audit log creation
    console.log('\n🔧 TESTING AUDIT LOG CREATION:');
    try {
      const testAuditLog = await prisma.auditLog.create({
        data: {
          actorUserId: null,
          organizerId: null,
          action: 'TEST_ACTION',
          entityType: 'Tournament',
          entityId: tournament.id,
          tournamentId: tournament.id,
          meta: { test: true }
        }
      });
      console.log('✅ Test audit log created successfully');
      
      // Clean up test audit log
      await prisma.auditLog.delete({
        where: { id: testAuditLog.id }
      });
      console.log('🗑️ Test audit log cleaned up');
    } catch (error) {
      console.error('❌ Failed to create test audit log:', error);
    }

    console.log('\n�� DIAGNOSIS COMPLETE!');
    console.log('Check the output above for any ❌ errors.');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTournamentInitialization()
  .then(() => {
    console.log('\n✨ Debug completed!');
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });