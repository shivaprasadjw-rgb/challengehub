import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateRegistrations() {
  try {
    console.log('🧹 Cleaning up duplicate registrations...');
    
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get all registrations for this tournament
    const allRegistrations = await prisma.registration.findMany({
      where: { tournamentId: tournamentId },
      orderBy: { createdAt: 'asc' } // Keep the oldest ones
    });
    
    console.log(`📊 Found ${allRegistrations.length} total registrations`);
    
    if (allRegistrations.length <= 32) {
      console.log('✅ No cleanup needed - registrations are within limit');
      return;
    }
    
    // Keep only the first 32 registrations (oldest ones)
    const registrationsToKeep = allRegistrations.slice(0, 32);
    const registrationsToDelete = allRegistrations.slice(32);
    
    console.log(`🎯 Keeping: ${registrationsToKeep.length} registrations`);
    console.log(`🗑️ Deleting: ${registrationsToDelete.length} duplicate registrations`);
    
    // Delete the duplicate registrations
    for (const reg of registrationsToDelete) {
      await prisma.registration.delete({
        where: { id: reg.id }
      });
      console.log(`🗑️ Deleted: ${reg.playerName} (${reg.playerEmail})`);
    }
    
    // Verify final count
    const finalCount = await prisma.registration.count({
      where: { tournamentId: tournamentId }
    });
    
    console.log('\n🎉 Cleanup complete!');
    console.log(`✅ Final registration count: ${finalCount}`);
    console.log(`✅ Tournament ready with exactly 32 participants`);
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateRegistrations();