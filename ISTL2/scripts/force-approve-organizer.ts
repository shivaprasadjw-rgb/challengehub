import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceApproveOrganizer() {
  try {
    console.log('🔍 Finding organizer to approve...');

    // Find the organizer
    const organizer = await prisma.organizer.findFirst({
      where: {
        name: 'Elite Sports Academy'
      }
    });

    if (!organizer) {
      console.log('❌ No organizer found with name Elite Sports Academy');
      return;
    }

    console.log('🏢 Found organizer:', organizer.name);
    console.log('📋 ID:', organizer.id);
    console.log('📊 Current Status:', organizer.status);

    // Force approve the organizer
    const updatedOrganizer = await prisma.organizer.update({
      where: {
        id: organizer.id
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log('✅ Organizer approved successfully!');
    console.log('📊 New Status:', updatedOrganizer.status);
    console.log('🔑 Login credentials: neworganizer@example.com / newpass123');
    console.log('🌐 Dashboard URL: /organizer/elite-sports-academy/dashboard');

    return updatedOrganizer;

  } catch (error) {
    console.error('❌ Error approving organizer:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

forceApproveOrganizer()
  .then(() => {
    console.log('\n✨ Organizer force approved successfully!');
  })
  .catch((error) => {
    console.error('💥 Failed to approve organizer:', error);
    process.exit(1);
  });
