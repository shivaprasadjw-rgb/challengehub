import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMembership() {
  try {
    console.log('🔧 Fixing broken membership...');

    // Find the user and organizer
    const user = await prisma.user.findUnique({
      where: { email: 'neworganizer@example.com' }
    });

    const organizer = await prisma.organizer.findFirst({
      where: { name: 'Elite Sports Academy' }
    });

    if (!user || !organizer) {
      console.log('❌ User or organizer not found');
      return;
    }

    // Delete existing broken membership
    await prisma.userOrganizer.deleteMany({
      where: {
        userId: user.id,
        organizerId: organizer.id
      }
    });
    console.log('🗑️ Deleted broken membership');

    // Create new membership
    const newMembership = await prisma.userOrganizer.create({
      data: {
        userId: user.id,
        organizerId: organizer.id,
        role: 'OWNER'
      }
    });

    console.log('✅ Created new membership for user:', newMembership.userId, 'organizer:', newMembership.organizerId);
    console.log('🎉 Login should now work!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMembership()
  .then(() => console.log('✨ Fix completed!'))
  .catch(error => console.error('💥 Fix failed:', error));