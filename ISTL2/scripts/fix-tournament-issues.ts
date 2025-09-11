import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixTournamentIssues() {
  try {
    console.log('🔧 Fixing tournament issues...');
    
    // Find the tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        title: 'Mumbai Badminton Championship 2025'
      },
      include: {
        organizer: true,
        registrations: true
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found!');
      return;
    }
    
    console.log(`🏆 Found tournament: ${tournament.title} (ID: ${tournament.id})`);
    console.log(`📊 Current status: ${tournament.status}`);
    console.log(`📝 Current registrations: ${tournament.registrations.length}`);
    
    // Fix organizer membership
    const organizerUser = await prisma.user.findUnique({
      where: { email: 'neworganizer@example.com' }
    });
    
    if (organizerUser) {
      // Check if membership exists
      const existingMembership = await prisma.userOrganizer.findFirst({
        where: {
          userId: organizerUser.id,
          organizerId: tournament.organizerId
        }
      });
      
      if (!existingMembership) {
        console.log('🔗 Creating organizer membership...');
        await prisma.userOrganizer.create({
          data: {
            userId: organizerUser.id,
            organizerId: tournament.organizerId,
            role: 'OWNER'
          }
        });
        console.log('✅ Created organizer membership');
      } else {
        console.log('✅ Organizer membership already exists');
      }
    }
    
    // Create registrations if they don't exist
    if (tournament.registrations.length === 0) {
      console.log('📝 Creating registrations...');
      
      // Real player names for 32 participants
      const realPlayers = [
        { name: 'Arjun Sharma', email: 'arjun.sharma@email.com', phone: '+91-9876543001', age: 24, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91-9876543002', age: 22, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Rahul Verma', email: 'rahul.verma@email.com', phone: '+91-9876543003', age: 26, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Anjali Singh', email: 'anjali.singh@email.com', phone: '+91-9876543004', age: 23, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Vikram Malhotra', email: 'vikram.malhotra@email.com', phone: '+91-9876543005', age: 25, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Sneha Reddy', email: 'sneha.reddy@email.com', phone: '+91-9876543006', age: 21, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Aditya Kumar', email: 'aditya.kumar@email.com', phone: '+91-9876543007', age: 27, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Meera Iyer', email: 'meera.iyer@email.com', phone: '+91-9876543008', age: 24, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Karan Mehta', email: 'karan.mehta@email.com', phone: '+91-9876543009', age: 23, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Divya Kapoor', email: 'divya.kapoor@email.com', phone: '+91-9876543010', age: 22, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Rohan Gupta', email: 'rohan.gupta@email.com', phone: '+91-9876543011', age: 26, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Isha Sharma', email: 'isha.sharma@email.com', phone: '+91-9876543012', age: 25, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Amit Desai', email: 'amit.desai@email.com', phone: '+91-9876543013', age: 24, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Riya Malhotra', email: 'riya.malhotra@email.com', phone: '+91-9876543014', age: 23, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Neeraj Tiwari', email: 'neeraj.tiwari@email.com', phone: '+91-9876543015', age: 25, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Zara Khan', email: 'zara.khan@email.com', phone: '+91-9876543016', age: 21, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Siddharth Joshi', email: 'siddharth.joshi@email.com', phone: '+91-9876543017', age: 26, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Tanvi Agarwal', email: 'tanvi.agarwal@email.com', phone: '+91-9876543018', age: 24, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Arnav Singh', email: 'arnav.singh@email.com', phone: '+91-9876543019', age: 23, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Kavya Patel', email: 'kavya.patel@email.com', phone: '+91-9876543020', age: 22, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Dhruv Sharma', email: 'dhruv.sharma@email.com', phone: '+91-9876543021', age: 25, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Ananya Reddy', email: 'ananya.reddy@email.com', phone: '+91-9876543022', age: 23, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Vivaan Kumar', email: 'vivaan.kumar@email.com', phone: '+91-9876543023', age: 24, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Myra Iyer', email: 'myra.iyer@email.com', phone: '+91-9876543024', age: 21, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Shaurya Mehta', email: 'shaurya.mehta@email.com', phone: '+91-9876543025', age: 26, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Aisha Kapoor', email: 'aisha.kapoor@email.com', phone: '+91-9876543026', age: 22, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Advait Gupta', email: 'advait.gupta@email.com', phone: '+91-9876543027', age: 25, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Kiara Sharma', email: 'kiara.sharma@email.com', phone: '+91-9876543028', age: 24, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Aarav Desai', email: 'aarav.desai@email.com', phone: '+91-9876543029', age: 23, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Saanvi Malhotra', email: 'saanvi.malhotra@email.com', phone: '+91-9876543030', age: 21, gender: 'FEMALE', category: 'WOMEN_SINGLES' },
        { name: 'Vihaan Tiwari', email: 'vihaan.tiwari@email.com', phone: '+91-9876543031', age: 26, gender: 'MALE', category: 'MEN_SINGLES' },
        { name: 'Aaradhya Joshi', email: 'aaradhya.joshi@email.com', phone: '+91-9876543032', age: 22, gender: 'FEMALE', category: 'WOMEN_SINGLES' }
      ];
      
      for (const player of realPlayers) {
        // Create user if doesn't exist
        let user = await prisma.user.findUnique({
          where: { email: player.email }
        });
        
        if (!user) {
          const hashedPassword = await bcrypt.hash('password123', 10);
          user = await prisma.user.create({
            data: {
              email: player.email,
              name: player.name,
              passwordHash: hashedPassword,
              role: 'PLAYER',
              status: 'ACTIVE'
            }
          });
        }
        
        // Create registration
        await prisma.registration.create({
          data: {
            tournamentId: tournament.id,
            playerName: player.name,
            playerEmail: player.email,
            playerPhone: player.phone,
            playerAge: player.age,
            playerGender: player.gender as 'MALE' | 'FEMALE',
            playerCategory: player.category,
            paymentStatus: 'SUCCEEDED',
            registeredAt: new Date()
          }
        });
        
        console.log(`✅ Registered: ${player.name}`);
      }
    }
    
    // Update tournament status to ACTIVE
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: 'ACTIVE' }
    });
    
    console.log('✅ Updated tournament status to ACTIVE');
    
    // Verify the fix
    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: {
        registrations: true,
        organizer: true
      }
    });
    
    console.log('\n🎉 Tournament fixed successfully!');
    console.log(`🏆 Tournament: ${updatedTournament!.title}`);
    console.log(`📊 Status: ${updatedTournament!.status}`);
    console.log(`👥 Registrations: ${updatedTournament!.registrations.length}`);
    console.log(`🏢 Organizer: ${updatedTournament!.organizer.name}`);
    console.log(`🔗 URL: http://localhost:3000/organizer/${updatedTournament!.organizer.slug}/tournaments/${updatedTournament!.id}`);
    
  } catch (error) {
    console.error('💥 Error fixing tournament:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTournamentIssues();
