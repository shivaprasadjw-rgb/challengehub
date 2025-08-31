import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRegistrationWithRealUser() {
  try {
    console.log('🔍 Checking Registration with real user email...');
    
    // First, let's see what users exist
    const users = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    
    console.log('👥 Available users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Use the first available user's email
    const realUserEmail = users[0].email;
    console.log(`\n🎯 Using real user email: ${realUserEmail}`);
    
    // Try to create registration with real user email
    const testRegistration = await prisma.registration.create({
      data: {
        tournamentId: 'cmeylmof20001mpozbg2h4ncn',
        playerName: 'Test Player',
        playerEmail: realUserEmail, // Use real user email
        playerPhone: '+91-98765-43210',
        playerCategory: 'SINGLES',
        playerAge: 25,
        playerGender: 'MALE',
        paymentStatus: 'SUCCEEDED',
        registeredAt: new Date()
      }
    });
    
    console.log('✅ Test registration created successfully!');
    console.log('📝 Registration data:', testRegistration);
    
    // Delete the test registration
    await prisma.registration.delete({
      where: { id: testRegistration.id }
    });
    console.log('️ Test registration deleted');
    
    console.log('\n🎯 Registration schema confirmed!');
    console.log('✅ All required fields identified');
    console.log('✅ Foreign key constraint understood');
    console.log('✅ Ready to create 32-player tournament');
    
  } catch (error) {
    console.error('💥 Registration creation failed:', error);
    console.log('❌ This shows us what fields are missing or invalid');
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrationWithRealUser();