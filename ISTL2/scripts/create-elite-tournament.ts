import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEliteTournament() {
  try {
    console.log('🏆 Creating Elite Sports Academy Tournament...');

    // Find the approved organizer
    const organizer = await prisma.organizer.findFirst({
      where: {
        name: 'Elite Sports Academy',
        status: 'APPROVED'
      }
    });

    if (!organizer) {
      console.log('❌ No approved organizer found for Elite Sports Academy');
      return;
    }

    console.log('✅ Found approved organizer:', organizer.name);

    // Create a venue
    const venue = await prisma.venue.create({
      data: {
        organizerId: organizer.id,
        name: 'Elite Sports Complex',
        locality: 'Elite Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        address: '123 Sports Complex, Elite Avenue, Mumbai, Maharashtra 400001'
      }
    });

    console.log('🏟️ Created venue:', venue.name);

    // Create the tournament
    const tournament = await prisma.tournament.create({
      data: {
        organizerId: organizer.id,
        title: 'Elite Tennis Championship 2024',
        sport: 'Tennis',
        date: new Date('2024-12-15T09:00:00Z'),
        entryFee: 1500.00,
        maxParticipants: 16,
        status: 'DRAFT',
        venueId: venue.id
      }
    });

    console.log('🎾 Created tournament:', tournament.title);

    // Create 16 real players with realistic names
    const players = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91-9876543210', age: 25, gender: 'MALE', category: 'Men Singles' },
      { name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91-9876543211', age: 23, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Amit Kumar', email: 'amit.kumar@email.com', phone: '+91-9876543212', age: 28, gender: 'MALE', category: 'Men Singles' },
      { name: 'Neha Singh', email: 'neha.singh@email.com', phone: '+91-9876543213', age: 26, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Vikram Malhotra', email: 'vikram.malhotra@email.com', phone: '+91-9876543214', age: 24, gender: 'MALE', category: 'Men Singles' },
      { name: 'Anjali Desai', email: 'anjali.desai@email.com', phone: '+91-9876543215', age: 22, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Rajesh Verma', email: 'rajesh.verma@email.com', phone: '+91-9876543216', age: 27, gender: 'MALE', category: 'Men Singles' },
      { name: 'Sneha Iyer', email: 'sneha.iyer@email.com', phone: '+91-9876543217', age: 25, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Deepak Gupta', email: 'deepak.gupta@email.com', phone: '+91-9876543218', age: 29, gender: 'MALE', category: 'Men Singles' },
      { name: 'Meera Reddy', email: 'meera.reddy@email.com', phone: '+91-9876543219', age: 24, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Arjun Joshi', email: 'arjun.joshi@email.com', phone: '+91-9876543220', age: 26, gender: 'MALE', category: 'Men Singles' },
      { name: 'Kavya Nair', email: 'kavya.nair@email.com', phone: '+91-9876543221', age: 23, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Suresh Menon', email: 'suresh.menon@email.com', phone: '+91-9876543222', age: 28, gender: 'MALE', category: 'Men Singles' },
      { name: 'Divya Kapoor', email: 'divya.kapoor@email.com', phone: '+91-9876543223', age: 25, gender: 'FEMALE', category: 'Women Singles' },
      { name: 'Mohan Das', email: 'mohan.das@email.com', phone: '+91-9876543224', age: 27, gender: 'MALE', category: 'Men Singles' },
      { name: 'Pooja Sharma', email: 'pooja.sharma@email.com', phone: '+91-9876543225', age: 26, gender: 'FEMALE', category: 'Women Singles' }
    ];

    console.log('👥 Creating 16 players...');

    // Create users and registrations for each player
    for (const player of players) {
      // Create user if doesn't exist
      let user = await prisma.user.findUnique({
        where: { email: player.email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: player.email,
            name: player.name,
            passwordHash: 'playerpass123',
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        });
        console.log(`  ✅ Created user: ${player.name}`);
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
      console.log(`  ✅ Registered: ${player.name}`);
    }

    // Create some judges
    const judges = [
      { name: 'Coach Rajesh Kumar', gender: 'MALE', categories: ['Tennis', 'Singles'], phone: '+91-9876543300', email: 'coach.rajesh@elitesports.com' },
      { name: 'Coach Priya Verma', gender: 'FEMALE', categories: ['Tennis', 'Doubles'], phone: '+91-9876543301', email: 'coach.priya@elitesports.com' },
      { name: 'Referee Amit Singh', gender: 'MALE', categories: ['Tennis', 'Officiating'], phone: '+91-9876543302', email: 'referee.amit@elitesports.com' }
    ];

    console.log('👨‍⚖️ Creating judges...');

    for (const judge of judges) {
      await prisma.judge.create({
        data: {
          organizerId: organizer.id,
          fullName: judge.name,
          gender: judge.gender as 'MALE' | 'FEMALE',
          categories: judge.categories,
          phone: judge.phone,
          email: judge.email,
          bio: `Experienced ${judge.categories.join(', ')} professional`
        }
      });
      console.log(`  ✅ Created judge: ${judge.name}`);
    }

    console.log('\n🎉 Elite Tournament Setup Complete!');
    console.log('🏆 Tournament:', tournament.title);
    console.log('🏟️ Venue:', venue.name);
    console.log('👥 Players:', players.length);
    console.log('👨‍⚖️ Judges:', judges.length);
    console.log('🔑 Organizer Login: neworganizer@example.com / newpass123');
    console.log('🌐 Tournament URL: /organizer/elite-sports-academy/tournaments/' + tournament.id);

    return { organizer, venue, tournament, players, judges };

  } catch (error) {
    console.error('❌ Error creating tournament:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createEliteTournament()
  .then(() => {
    console.log('\n✨ Elite tournament created successfully!');
  })
  .catch((error) => {
    console.error('💥 Failed to create tournament:', error);
    process.exit(1);
  });
