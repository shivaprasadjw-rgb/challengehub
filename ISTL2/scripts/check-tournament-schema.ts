import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTournamentSchema() {
  try {
    console.log('🔍 Checking Tournament model fields...');
    
    // Try to create a minimal tournament to see what fields are required
    const testTournament = await prisma.tournament.create({
      data: {
        organizerId: 'cmey30c9i000277xw44pb4ok3', // Use existing organizer ID
        title: 'Test Tournament',
        sport: 'Tennis',
        date: new Date('2025-01-15T09:00:00Z'),
        entryFee: 1000,
        maxParticipants: 16,
        status: 'DRAFT',
        venueId: 'cmey33x2c00012zzef849au6l' // Use existing venue ID
      }
    });
    
    console.log('✅ Test tournament created successfully!');
    console.log('�� Tournament data:', testTournament);
    
    // Delete the test tournament
    await prisma.tournament.delete({
      where: { id: testTournament.id }
    });
    console.log('🗑️ Test tournament deleted');
    
  } catch (error) {
    console.error('💥 Schema check failed:', error);
    console.log('❌ This shows us what fields are missing or invalid');
  } finally {
    await prisma.$disconnect();
  }
}

checkTournamentSchema();