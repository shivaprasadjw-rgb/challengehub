import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRegistrationFields() {
  try {
    console.log('🔍 Checking Registration model fields...');
    
    // Try to create a minimal registration to see what fields are available
    const testRegistration = await prisma.registration.create({
      data: {
        tournamentId: 'cmeylmof20001mpozbg2h4ncn', // Use the tournament we created
        playerName: 'Test Player',
        playerEmail: 'test@email.com',
        playerPhone: '+91-98765-43210',
        playerCategory: 'SINGLES',
        playerSkillLevel: 'BEGINNER',
        playerAge: 25,
        playerGender: 'MALE',
        paymentStatus: 'SUCCEEDED',
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test registration created successfully!');
    console.log('📝 Registration data:', testRegistration);
    
    // Delete the test registration
    await prisma.registration.delete({
      where: { id: testRegistration.id }
    });
    console.log('��️ Test registration deleted');
    
  } catch (error) {
    console.error('💥 Registration creation failed:', error);
    console.log('❌ This shows us what fields are missing or invalid');
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrationFields();