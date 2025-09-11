import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEliteTournamentForDelete() {
  try {
    console.log('🔧 Fixing Elite tournament for delete testing...');

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

    console.log(`✅ Found tournament: ${tournament.title}`);
    console.log(`�� Current status: ${tournament.status}`);
    console.log(`👥 Registrations: ${tournament.registrations.length}`);
    console.log(`🏆 Rounds: ${tournament.rounds.length}`);
    console.log(`⚽ Matches: ${tournament.matches.length}`);

    // Reset to DRAFT status and clear all data for delete testing
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        status: 'DRAFT'
      }
    });

    // Delete all rounds
    if (tournament.rounds.length > 0) {
      await prisma.tournamentRound.deleteMany({
        where: { tournamentId: tournament.id }
      });
      console.log('🗑️ Deleted all rounds');
    }

    // Delete all matches
    if (tournament.matches.length > 0) {
      await prisma.match.deleteMany({
        where: { tournamentId: tournament.id }
      });
      console.log('🗑️ Deleted all matches');
    }

    // Delete all registrations
    if (tournament.registrations.length > 0) {
      await prisma.registration.deleteMany({
        where: { tournamentId: tournament.id }
      });
      console.log('🗑️ Deleted all registrations');
    }

    // Verify the tournament is now deletable
    const finalTournament = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: {
        registrations: true,
        rounds: true,
        matches: true
      }
    });

    console.log('\n🎯 Final tournament state:');
    console.log(`📊 Status: ${finalTournament?.status}`);
    console.log(`👥 Registrations: ${finalTournament?.registrations.length}`);
    console.log(`🏆 Rounds: ${finalTournament?.rounds.length}`);
    console.log(`⚽ Matches: ${finalTournament?.matches.length}`);

    if (finalTournament?.status === 'DRAFT' && 
        finalTournament?.registrations.length === 0 &&
        finalTournament?.rounds.length === 0 &&
        finalTournament?.matches.length === 0) {
      console.log('✅ Tournament is now deletable!');
      console.log(`🔗 Test URL: http://localhost:3000/organizer/elite-sports-academy/tournaments/${tournament.id}`);
    } else {
      console.log('❌ Tournament still cannot be deleted');
    }

  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEliteTournamentForDelete();