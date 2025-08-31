import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugOrganizerSetup() {
  try {
    console.log('🔍 Debugging organizer setup...');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'neworganizer@example.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email);

    // Check if organizer exists
    const organizer = await prisma.organizer.findFirst({
      where: { name: 'Elite Sports Academy' }
    });

    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }
    console.log('✅ Organizer found:', organizer.name);
    console.log('📊 Organizer status:', organizer.status);
    console.log('🔗 Owner user ID:', organizer.ownerUserId);

    // Check if membership exists
    const membership = await prisma.userOrganizer.findFirst({
      where: {
        userId: user.id,
        organizerId: organizer.id
      }
    });

    if (membership) {
      console.log('✅ Membership exists:', membership.id);
    } else {
      console.log('❌ No membership found');
      
      // Try to create membership
      console.log('\n🔧 Creating membership...');
      try {
        const newMembership = await prisma.userOrganizer.create({
          data: {
            userId: user.id,
            organizerId: organizer.id,
            role: 'OWNER'
          }
        });
        console.log('✅ Membership created successfully:', newMembership.id);
      } catch (error) {
        console.error('❌ Failed to create membership:', error);
      }
    }

    // Check all organizers
    console.log('\n🏢 All organizers in database:');
    const allOrganizers = await prisma.organizer.findMany({
      include: { owner: true }
    });
    
    allOrganizers.forEach(org => {
      console.log(`  - ${org.name} (${org.slug}) - Status: ${org.status} - Owner: ${org.owner.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrganizerSetup()
  .then(() => {
    console.log('\n✨ Debug completed!');
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });