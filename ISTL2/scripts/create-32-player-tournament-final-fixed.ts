import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create32PlayerTournamentFixed() {
  try {
    console.log('🎉 Finalizing 32-player tournament setup...');
    
    // Tournament already exists: Elite Tennis Championship 2025 - 32 Players
    const tournamentId = 'cmeylmof20001mpozbg2h4ncn';
    
    // Get existing users for registrations (we have 80+ users available)
    const users = await prisma.user.findMany({
      where: {
        role: 'PLAYER', // Only use actual players, not admins/organizers
        email: {
          notIn: ['admin@sportsindia.com', 'neworganizer@example.com', 'test@example.com']
        }
      },
      select: { email: true, name: true },
      take: 32 // Limit to 32 players
    });
    
    if (users.length < 32) {
      console.log(`❌ Only ${users.length} players available, need 32`);
      return;
    }
    
    console.log(`✅ Found ${users.length} players for tournament`);
    
    // Create 32 registrations
    const registrations = [];
    for (let i = 0; i < 32; i++) {
      const user = users[i];
      const playerAge = 18 + (i % 20); // Ages 18-37
      const playerGender = i % 2 === 0 ? 'MALE' : 'FEMALE';
      
      const registration = await prisma.registration.create({
        data: {
          tournamentId: tournamentId,
          playerName: user.name || `Player ${i + 1}`,
          playerEmail: user.email,
          playerPhone: `+91-98765-${String(i + 1).padStart(5, '0')}`,
          playerAge: playerAge,
          playerGender: playerGender,
          playerCategory: 'SINGLES',
          paymentStatus: 'SUCCEEDED',
          registeredAt: new Date()
        }
      });
      
      registrations.push(registration);
      console.log(`✅ Created registration ${i + 1}/32: ${user.name} (${user.email})`);
    }
    
    // Verify the tournament is ready
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: true
      }
    });
    
    console.log('\n🎉 Tournament setup complete!');
    console.log(`�� Tournament: ${tournament?.title}`);
    console.log(`👥 Participants: ${registrations.length}`);
    console.log(`📊 Status: ${tournament?.status}`);
    console.log(`🔗 URL: http://localhost:3000/organizer/elite-sports-academy/tournaments/${tournamentId}`);
    
    console.log('\n�� Next steps:');
    console.log('1. Go to the tournament page');
    console.log('2. Click "Initialize Tournament"');
    console.log('3. Test the progression system with 32 participants');
    
  } catch (error) {
    console.error('💥 Tournament creation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create32PlayerTournamentFixed();