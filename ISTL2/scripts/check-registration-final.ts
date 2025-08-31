import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRegistrationFinal() {
  try {
    console.log('🔍 Final check - Registration model with only required fields...');
    
    // Only include fields that actually exist in the schema
    const testRegistration = await prisma.registration.create({
      data: {
        tournamentId: 'cmeylmof20001mpozbg2h4ncn',
        playerName: 'Test Player',
        playerEmail: 'test@email.com',
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
    console.log('✅ Ready to create 32-player tournament');
    
  } catch (error) {
    console.error('💥 Registration creation failed:', error);
    console.log('❌ This shows us what fields are missing or invalid');
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrationFinal();