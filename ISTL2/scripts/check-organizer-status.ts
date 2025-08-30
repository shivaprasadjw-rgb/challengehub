import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrganizerStatus() {
  try {
    console.log('🔍 Checking organizer status...');

    // Find the organizer
    const organizer = await prisma.organizer.findFirst({
      where: {
        name: 'Elite Sports Academy'
      },
      include: {
        owner: true,
        applications: true
      }
    });

    if (!organizer) {
      console.log('❌ No organizer found with name Elite Sports Academy');
      return;
    }

    console.log('🏢 Organizer:', organizer.name);
    console.log('📋 ID:', organizer.id);
    console.log('🔗 Slug:', organizer.slug);
    console.log('📊 Status:', organizer.status);
    console.log('👤 Owner:', organizer.owner.email);
    console.log('📅 Created:', organizer.createdAt);

    if (organizer.applications.length > 0) {
      console.log('\n📋 Applications:');
      organizer.applications.forEach(app => {
        console.log(`  - ${app.orgName}: ${app.status} (${app.submittedAt})`);
      });
    }

    // Check if we can create tournaments
    if (organizer.status === 'APPROVED') {
      console.log('\n✅ Organizer is approved and ready to create tournaments!');
      console.log('🔑 Login credentials: neworganizer@example.com / newpass123');
      console.log('🌐 Dashboard URL: /organizer/elite-sports-academy/dashboard');
    } else {
      console.log('\n⚠️ Organizer is not yet approved. Status:', organizer.status);
    }

    return organizer;

  } catch (error) {
    console.error('❌ Error checking organizer status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganizerStatus()
  .then(() => {
    console.log('\n✨ Status check completed!');
  })
  .catch((error) => {
    console.error('💥 Failed to check status:', error);
    process.exit(1);
  });
