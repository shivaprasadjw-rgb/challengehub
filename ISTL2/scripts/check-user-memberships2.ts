import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserMemberships() {
  try {
    console.log('🔍 Checking user memberships for neworganizer@example.com...');

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'neworganizer@example.com'
      },
      include: {
        organizerMemberships: {
          include: {
            organizer: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found: neworganizer@example.com');
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('📊 Status:', user.status);
    console.log('🔐 Has Password Hash:', !!user.passwordHash);

    console.log('\n🏢 Organizer Memberships:');
    if (user.organizerMemberships.length > 0) {
      user.organizerMemberships.forEach(membership => {
        console.log(`  - ${membership.organizer.name} (${membership.organizer.slug})`);
        console.log(`    Role: ${membership.role}`);
        console.log(`    Organizer Status: ${membership.organizer.status}`);
        console.log(`    Organizer ID: ${membership.organizer.id}`);
      });
    } else {
      console.log('  ❌ No organizer memberships found!');
      
      // Check if organizer exists
      const organizer = await prisma.organizer.findFirst({
        where: {
          name: 'Elite Sports Academy'
        }
      });

      if (organizer) {
        console.log('\n🔧 Creating missing membership...');
        
        // Create the membership
        const membership = await prisma.userOrganizer.create({
          data: {
            userId: user.id,
            organizerId: organizer.id,
            role: 'OWNER'
          }
        });

        console.log('✅ Created membership:', membership);
        console.log(' User should now be able to login and access organizer dashboard!');
      } else {
        console.log('❌ Organizer not found either!');
      }
    }

    return user;

  } catch (error) {
    console.error('❌ Error checking memberships:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUserMemberships()
  .then(() => {
    console.log('\n✨ Membership check completed!');
  })
  .catch((error) => {
    console.error('💥 Failed to check memberships:', error);
    process.exit(1);
  });