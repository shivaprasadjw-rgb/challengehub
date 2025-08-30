import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createNewOrganizer() {
  try {
    console.log('🚀 Creating new organizer application...');

    // Create a new user for the organizer
    const organizerUser = await prisma.user.create({
      data: {
        email: 'neworganizer@example.com',
        name: 'New Tournament Organizer',
        passwordHash: 'newpass123', // This should be hashed in production
        role: 'ORG_USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created organizer user:', organizerUser.email);

    // Create the organizer first
    const organizer = await prisma.organizer.create({
      data: {
        name: 'Elite Sports Academy',
        slug: 'elite-sports-academy',
        status: 'PENDING',
        ownerUserId: organizerUser.id,
        contact: {
          address: '123 Sports Complex, Elite Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          contactNumber: '+91-9876543210',
          contactEmail: 'neworganizer@example.com',
          website: 'https://elitesportsacademy.com',
          experience: '5+ years organizing district and state-level tournaments',
          facilities: 'Professional courts, electronic scoring, medical support, refreshments'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created organizer:', organizer.name);

    // Create organizer application
    const application = await prisma.organizerApplication.create({
      data: {
        userId: organizerUser.id,
        organizerId: organizer.id,
        orgName: 'Elite Sports Academy',
        docsURL: 'https://elitesportsacademy.com/docs',
        status: 'PENDING',
        submittedAt: new Date()
      }
    });

    console.log('✅ Created organizer application:', application.orgName);
    console.log('📋 Application ID:', application.id);
    console.log('📧 User Email:', organizerUser.email);
    console.log('🏢 Organizer Slug:', organizer.slug);

    console.log('\n🎯 Next Steps:');
    console.log('1. Super Admin needs to approve this application');
    console.log('2. After approval, we can create tournaments and venues');
    console.log('3. The organizer can login with: neworganizer@example.com / newpass123');
    console.log('4. Organizer URL will be: /organizer/elite-sports-academy/dashboard');

    return { organizerUser, organizer, application };

  } catch (error) {
    console.error('❌ Error creating organizer:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createNewOrganizer()
  .then(() => {
    console.log('\n✨ Organizer application created successfully!');
  })
  .catch((error) => {
    console.error('💥 Failed to create organizer:', error);
    process.exit(1);
  });
