import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createNewTournament32Real() {
  try {
    console.log('🏆 Creating new tournament with 32 real participants...');
    
    // Get the organizer by slug
    let organizerData = await prisma.organizer.findFirst({
      where: { 
        slug: 'new-sports-academy'
      }
    });
    
    if (!organizerData) {
      console.log('❌ Organizer not found. Creating organizer first...');
      
      // First get or create a user for the organizer
      let organizerUser = await prisma.user.findUnique({
        where: { email: 'neworganizer@example.com' }
      });
      
      if (!organizerUser) {
        organizerUser = await prisma.user.create({
          data: {
            email: 'neworganizer@example.com',
            name: 'New Sports Academy',
            passwordHash: await bcrypt.hash('password123', 10),
            role: 'ORG_USER',
            status: 'ACTIVE'
          }
        });
        console.log('✅ Created organizer user');
      } else {
        console.log('✅ Found existing organizer user');
      }
      
      // Create organizer
      organizerData = await prisma.organizer.create({
        data: {
          name: 'New Sports Academy',
          slug: 'new-sports-academy',
          status: 'APPROVED',
          ownerUserId: organizerUser.id,
          contact: {
            email: 'neworganizer@example.com',
            phone: '+91-9876543210',
            address: '123 Sports Complex, Mumbai, Maharashtra'
          }
        }
      });
      
      console.log('✅ Created organizer:', organizerData.name);
    } else {
      console.log('✅ Found existing organizer:', organizerData.name);
    }
    
    // Create venue
    const venue = await prisma.venue.create({
      data: {
        name: 'New Sports Complex',
        address: '123 Sports Complex, Mumbai, Maharashtra',
        locality: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        organizerId: organizerData.id
      }
    });
    
    console.log('✅ Created venue:', venue.name);
    
    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        title: 'Mumbai Badminton Championship 2025',
        sport: 'Badminton',
        maxParticipants: 32,
        entryFee: 500,
        date: new Date('2025-09-15'),
        venueId: venue.id,
        organizerId: organizerData.id,
        status: 'DRAFT'
      }
    });
    
    console.log('✅ Created tournament:', tournament.title);
    
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
    
    console.log('📝 Creating registrations for 32 players...');
    
    // Create registrations
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
    
    // Update tournament with current participants count
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        status: 'ACTIVE'
      }
    });
    
    console.log('\n🎉 Tournament created successfully!');
    console.log(`🏆 Tournament: ${tournament.title}`);
    console.log(`👥 Participants: ${realPlayers.length}`);
    console.log(`🏢 Organizer: ${organizerData.name}`);
    console.log(`📍 Venue: ${venue.name}`);
    console.log(`🔗 Tournament URL: http://localhost:3000/organizer/${organizerData.slug}/tournaments/${tournament.id}`);
    
  } catch (error) {
    console.error('💥 Creation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewTournament32Real();
