import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveNewOrganizer() {
  try {
    console.log('🔍 Looking for the new organizer application...');

    // Find the organizer application
    const application = await prisma.organizerApplication.findFirst({
      where: {
        orgName: 'Elite Sports Academy',
        status: 'PENDING'
      },
      include: {
        organizer: true,
        user: true
      }
    });

    if (!application) {
      console.log('❌ No pending application found for Elite Sports Academy');
      return;
    }

    console.log('✅ Found application:', application.orgName);
    console.log('📋 Application ID:', application.id);

    // Get the super admin user
    const superAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    });

    if (!superAdmin) {
      console.log('❌ No super admin user found');
      return;
    }

    console.log('👑 Super Admin:', superAdmin.email);

    // Approve the application
    const updatedApplication = await prisma.organizerApplication.update({
      where: {
        id: application.id
      },
      data: {
        status: 'APPROVED',
        decidedAt: new Date(),
        decidedBy: superAdmin.id
      }
    });

    // Update the organizer status to APPROVED
    const updatedOrganizer = await prisma.organizer.update({
      where: {
        id: application.organizer.id
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log('✅ Application approved successfully!');
    console.log('🏢 Organizer status updated to:', updatedOrganizer.status);
    console.log('📧 Organizer email:', application.user.email);
    console.log('🔑 Login credentials: neworganizer@example.com / newpass123');
    console.log('🌐 Dashboard URL: /organizer/elite-sports-academy/dashboard');

    return { application: updatedApplication, organizer: updatedOrganizer };

  } catch (error) {
    console.error('❌ Error approving organizer:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

approveNewOrganizer()
  .then(() => {
    console.log('\n✨ Organizer approved successfully!');
  })
  .catch((error) => {
    console.error('💥 Failed to approve organizer:', error);
    process.exit(1);
  });
