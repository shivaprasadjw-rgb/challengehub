import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function create32PlayerTournamentCorrect() {
  try {
    console.log('🏆 Creating new tournament with 32 participants...');

    // Find the organizer
    const organizer = await prisma.organizer.findFirst({
      where: { 
        name: 'Elite Sports Academy',
        status: 'APPROVED'
      }
    });

    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }

    console.log(`✅ Found organizer: ${organizer.name}`);

    // Find or create a venue
    let venue = await prisma.venue.findFirst({
      where: { organizerId: organizer.id }
    });

    if (!venue) {
      venue = await prisma.venue.create({
        data: {
          organizerId: organizer.id,
          name: 'Elite Sports Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          locality: 'Elite Avenue',
          pincode: '400001',
          address: '123 Elite Avenue, Mumbai, Maharashtra 400001'
        }
      });
      console.log('✅ Created venue: Elite Sports Complex');
    }

    // Create the tournament with correct fields
    const tournament = await prisma.tournament.create({
      data: {
        organizerId: organizer.id,
        title: 'Elite Tennis Championship 2025 - 32 Players',
        sport: 'Tennis',
        date: new Date('2025-01-15T09:00:00Z'),
        entryFee: 2000.00,
        maxParticipants: 32,
        status: 'DRAFT',
        venueId: venue.id
      }
    });

    console.log(`✅ Created tournament: ${tournament.title}`);
    console.log(`🏆 Tournament ID: ${tournament.id}`);

    // Create 32 real players with realistic names
    const playerNames = [
      'Rahul Sharma', 'Priya Patel', 'Arjun Singh', 'Ananya Reddy',
      'Vikram Malhotra', 'Zara Khan', 'Aditya Verma', 'Ishita Gupta',
      'Rohan Mehta', 'Kavya Joshi', 'Dhruv Kapoor', 'Mira Choudhury',
      'Aarav Tiwari', 'Saanvi Nair', 'Vivaan Iyer', 'Kiara Menon',
      'Advait Desai', 'Anvi Rao', 'Kabir Bhat', 'Riya Saxena',
      'Yuvan Chopra', 'Aisha Malhotra', 'Reyansh Kumar', 'Diya Sharma',
      'Arnav Singh', 'Myra Patel', 'Shaurya Verma', 'Zara Reddy',
      'Vedant Mehta', 'Anaya Joshi', 'Rudra Kapoor', 'Kiara Iyer'
    ];

    const playerEmails = [
      'rahul.sharma@email.com', 'priya.patel@email.com', 'arjun.singh@email.com', 'ananya.reddy@email.com',
      'vikram.malhotra@email.com', 'zara.khan@email.com', 'aditya.verma@email.com', 'ishita.gupta@email.com',
      'rohan.mehta@email.com', 'kavya.joshi@email.com', 'dhruv.kapoor@email.com', 'mira.choudhury@email.com',
      'aarav.tiwari@email.com', 'saanvi.nair@email.com', 'vivaan.iyer@email.com', 'kiara.menon@email.com',
      'advait.desai@email.com', 'anvi.rao@email.com', 'kabir.bhat@email.com', 'riya.saxena@email.com',
      'yuvan.chopra@email.com', 'aisha.malhotra@email.com', 'reyansh.kumar@email.com', 'diya.sharma@email.com',
      'arnav.singh@email.com', 'myra.patel@email.com', 'shaurya.verma@email.com', 'zara.reddy@email.com',
      'vedant.mehta@email.com', 'anaya.joshi@email.com', 'rudra.kapoor@email.com', 'kiara.iyer@email.com'
    ];

    const phoneNumbers = [
      '+91-98765-43210', '+91-98765-43211', '+91-98765-43212', '+91-98765-43213',
      '+91-98765-43214', '+91-98765-43215', '+91-98765-43216', '+91-98765-43217',
      '+91-98765-43218', '+91-98765-43219', '+91-98765-43220', '+91-98765-43221',
      '+91-98765-43222', '+91-98765-43223', '+91-98765-43224', '+91-98765-43225',
      '+91-98765-43226', '+91-98765-43227', '+91-98765-43228', '+91-98765-43229',
      '+91-98765-43230', '+91-98765-43231', '+91-98765-43232', '+91-98765-43233',
      '+91-98765-43234', '+91-98765-43235', '+91-98765-43236', '+91-98765-43237',
      '+91-98765-43238', '+91-98765-43239', '+91-98765-43240', '+91-98765-43241'
    ];

    const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];

    // Create users and registrations
    for (let i = 0; i < 32; i++) {
      // Create user if doesn't exist
      let user = await prisma.user.findUnique({
        where: { email: playerEmails[i] }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: playerEmails[i],
            name: playerNames[i],
            passwordHash: await bcrypt.hash('player123', 10),
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        });
        console.log(`✅ Created user: ${playerNames[i]}`);
      }

      // Create registration
      const registration = await prisma.registration.create({
        data: {
          tournamentId: tournament.id,
          playerName: playerNames[i],
          playerEmail: playerEmails[i],
          playerPhone: phoneNumbers[i],
          playerCategory: 'SINGLES',
          playerAge: 18 + (i % 20), // Ages 18-37
          playerGender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          paymentStatus: 'SUCCEEDED',
          registeredAt: new Date()
        }
      });

      console.log(`✅ Registered player: ${playerNames[i]}`);
    }

    // Count actual registrations
    const registrationCount = await prisma.registration.count({
      where: { tournamentId: tournament.id }
    });

    console.log('\n🎯 Tournament Setup Complete!');
    console.log(` Tournament: ${tournament.title}`);
    console.log(`👥 Participants: ${registrationCount}`);
    console.log(`📍 Venue: ${venue.name}`);
    console.log(`🔗 Tournament URL: http://localhost:3000/organizer/elite-sports-academy/tournaments/${tournament.id}`);
    console.log(`📊 Status: Ready for progression testing`);

    // Test URL for the organizer
    console.log(`\n🔗 Organizer Dashboard: http://localhost:3000/organizer/elite-sports-academy/dashboard`);
    console.log(`🔗 Tournaments List: http://localhost:3000/organizer/elite-sports-academy/tournaments`);

  } catch (error) {
    console.error('💥 Tournament creation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation
create32PlayerTournamentCorrect();