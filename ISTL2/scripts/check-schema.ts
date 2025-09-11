import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');

    // Check UserOrganizer table structure
    const memberships = await prisma.userOrganizer.findMany({
      take: 5,
      include: {
        user: true,
        organizer: true
      }
    });

    console.log('\n📋 UserOrganizer records:');
    memberships.forEach((membership, index) => {
      console.log(`\n${index + 1}. Membership:`);
      console.log(`   User ID: ${membership.userId}`);
      console.log(`   Organizer ID: ${membership.organizerId}`);
      console.log(`   User: ${membership.user.email}`);
      console.log(`   Organizer: ${membership.organizer.name}`);
      console.log(`   Role: ${membership.role}`);
      console.log(`   Full object:`, JSON.stringify(membership, null, 2));
    });

    // Check if there are any memberships
    console.log(`\n📊 Total memberships found: ${memberships.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema()
  .then(() => console.log('\n✨ Schema check completed!'))
  .catch(error => console.error('💥 Schema check failed:', error));