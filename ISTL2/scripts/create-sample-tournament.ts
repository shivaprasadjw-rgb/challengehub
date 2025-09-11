import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleTournament() {
  try {
    console.log('🏆 Creating sample tournament data...')

    // Get the Sports India organizer
    const organizer = await prisma.organizer.findUnique({
      where: { slug: 'sports-india' }
    })

    if (!organizer) {
      console.error('❌ Sports India organizer not found. Please run the seed script first.')
      return
    }

    // Get or create a venue
    let venue = await prisma.venue.findFirst({
      where: { organizerId: organizer.id }
    })

    if (!venue) {
      venue = await prisma.venue.create({
        data: {
          organizerId: organizer.id,
          name: 'Sports India Indoor Arena',
          locality: 'Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400058',
          address: '123 Sports Complex, Andheri West, Mumbai - 400058'
        }
      })
      console.log('✅ Created sample venue:', venue.name)
    }

    // Create a sample tournament
    const tournament = await prisma.tournament.create({
      data: {
        organizerId: organizer.id,
        title: 'Mumbai Open Badminton Championship 2024',
        sport: 'Badminton',
        date: new Date('2024-02-15T09:00:00Z'),
        entryFee: 500.00,
        maxParticipants: 32,
        status: 'ACTIVE',
        venueId: venue.id
      }
    })
    console.log('✅ Created sample tournament:', tournament.title)

    // Create sample judges
    const judges = []
    const judgeData = [
      {
        fullName: 'Rajesh Kumar',
        gender: 'MALE' as const,
        categories: ['Men\'s Singles', 'Mixed Doubles'],
        phone: '+91-9876543210',
        email: 'rajesh.kumar@judges.com',
        bio: 'Certified BWF referee with 10+ years experience'
      },
      {
        fullName: 'Priya Sharma',
        gender: 'FEMALE' as const,
        categories: ['Women\'s Singles', 'Women\'s Doubles'],
        phone: '+91-9876543211',
        email: 'priya.sharma@judges.com',
        bio: 'National level badminton referee and coach'
      },
      {
        fullName: 'Suresh Patel',
        gender: 'MALE' as const,
        categories: ['Men\'s Doubles', 'Mixed Doubles'],
        phone: '+91-9876543212',
        email: 'suresh.patel@judges.com',
        bio: 'International badminton umpire with BWF certification'
      }
    ]

    for (const judgeInfo of judgeData) {
      const existingJudge = await prisma.judge.findFirst({
        where: { 
          organizerId: organizer.id,
          email: judgeInfo.email
        }
      })

      if (!existingJudge) {
        const judge = await prisma.judge.create({
          data: {
            organizerId: organizer.id,
            ...judgeInfo
          }
        })
        judges.push(judge)
        console.log('✅ Created judge:', judge.fullName)
      } else {
        judges.push(existingJudge)
        console.log('ℹ️ Judge already exists:', existingJudge.fullName)
      }
    }

    // Assign judges to tournament
    for (const judge of judges) {
      const existingAssignment = await prisma.judgeAssignment.findUnique({
        where: {
          judgeId_tournamentId: {
            judgeId: judge.id,
            tournamentId: tournament.id
          }
        }
      })

      if (!existingAssignment) {
        await prisma.judgeAssignment.create({
          data: {
            judgeId: judge.id,
            tournamentId: tournament.id,
            role: 'JUDGE'
          }
        })
        console.log('✅ Assigned judge to tournament:', judge.fullName)
      }
    }

    // Create sample registrations
    const registrationData = [
      // Men's Singles Players
      {
        playerName: 'Arjun Reddy',
        playerEmail: 'arjun.reddy@players.com',
        playerPhone: '+91-9876001001',
        playerAge: 25,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Vikash Singh',
        playerEmail: 'vikash.singh@players.com',
        playerPhone: '+91-9876001002',
        playerAge: 28,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Rohit Sharma',
        playerEmail: 'rohit.sharma@players.com',
        playerPhone: '+91-9876001003',
        playerAge: 24,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Karan Mehta',
        playerEmail: 'karan.mehta@players.com',
        playerPhone: '+91-9876001004',
        playerAge: 27,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Amit Gupta',
        playerEmail: 'amit.gupta@players.com',
        playerPhone: '+91-9876001005',
        playerAge: 26,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Deepak Kumar',
        playerEmail: 'deepak.kumar@players.com',
        playerPhone: '+91-9876001006',
        playerAge: 29,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Manoj Tiwari',
        playerEmail: 'manoj.tiwari@players.com',
        playerPhone: '+91-9876001007',
        playerAge: 23,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      {
        playerName: 'Sanjay Yadav',
        playerEmail: 'sanjay.yadav@players.com',
        playerPhone: '+91-9876001008',
        playerAge: 30,
        playerGender: 'MALE' as const,
        playerCategory: 'Men\'s Singles'
      },
      // Women's Singles Players
      {
        playerName: 'Priya Nair',
        playerEmail: 'priya.nair@players.com',
        playerPhone: '+91-9876002001',
        playerAge: 24,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Ananya Iyer',
        playerEmail: 'ananya.iyer@players.com',
        playerPhone: '+91-9876002002',
        playerAge: 22,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Sneha Desai',
        playerEmail: 'sneha.desai@players.com',
        playerPhone: '+91-9876002003',
        playerAge: 26,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Kavya Joshi',
        playerEmail: 'kavya.joshi@players.com',
        playerPhone: '+91-9876002004',
        playerAge: 25,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Divya Menon',
        playerEmail: 'divya.menon@players.com',
        playerPhone: '+91-9876002005',
        playerAge: 27,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Shruti Agarwal',
        playerEmail: 'shruti.agarwal@players.com',
        playerPhone: '+91-9876002006',
        playerAge: 23,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Ritu Verma',
        playerEmail: 'ritu.verma@players.com',
        playerPhone: '+91-9876002007',
        playerAge: 28,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      {
        playerName: 'Pooja Rajput',
        playerEmail: 'pooja.rajput@players.com',
        playerPhone: '+91-9876002008',
        playerAge: 24,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Women\'s Singles'
      },
      // Mixed Doubles Players
      {
        playerName: 'Rahul Kapoor',
        playerEmail: 'rahul.kapoor@players.com',
        playerPhone: '+91-9876003001',
        playerAge: 26,
        playerGender: 'MALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Neha Kapoor',
        playerEmail: 'neha.kapoor@players.com',
        playerPhone: '+91-9876003002',
        playerAge: 24,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Akash Patel',
        playerEmail: 'akash.patel@players.com',
        playerPhone: '+91-9876003003',
        playerAge: 27,
        playerGender: 'MALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Isha Patel',
        playerEmail: 'isha.patel@players.com',
        playerPhone: '+91-9876003004',
        playerAge: 25,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Suraj Malhotra',
        playerEmail: 'suraj.malhotra@players.com',
        playerPhone: '+91-9876003005',
        playerAge: 29,
        playerGender: 'MALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Riya Malhotra',
        playerEmail: 'riya.malhotra@players.com',
        playerPhone: '+91-9876003006',
        playerAge: 26,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Arpit Jain',
        playerEmail: 'arpit.jain@players.com',
        playerPhone: '+91-9876003007',
        playerAge: 28,
        playerGender: 'MALE' as const,
        playerCategory: 'Mixed Doubles'
      },
      {
        playerName: 'Simran Jain',
        playerEmail: 'simran.jain@players.com',
        playerPhone: '+91-9876003008',
        playerAge: 24,
        playerGender: 'FEMALE' as const,
        playerCategory: 'Mixed Doubles'
      }
    ]

    // Create users first (required for registration foreign key)
    console.log('📝 Creating user accounts for players...')
    for (const regData of registrationData) {
      const existingUser = await prisma.user.findUnique({
        where: { email: regData.playerEmail }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: regData.playerEmail,
            name: regData.playerName,
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        })
      }
    }

    // Create registrations
    let registrationCount = 0
    for (const regData of registrationData) {
      const existingReg = await prisma.registration.findFirst({
        where: {
          tournamentId: tournament.id,
          playerEmail: regData.playerEmail
        }
      })

      if (!existingReg) {
        await prisma.registration.create({
          data: {
            tournamentId: tournament.id,
            ...regData,
            paymentStatus: 'SUCCEEDED'
          }
        })
        registrationCount++
      }
    }
    console.log(`✅ Created ${registrationCount} tournament registrations`)

    // Create tournament audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: organizer.id,
        action: 'CREATE_SAMPLE_TOURNAMENT',
        entityType: 'Tournament',
        entityId: tournament.id,
        tournamentId: tournament.id,
        meta: {
          tournamentTitle: tournament.title,
          totalRegistrations: registrationCount,
          judgesAssigned: judges.length,
          venue: venue.name,
          createdBy: 'Sample Data Script'
        }
      }
    })

    console.log('\n🎉 Sample tournament data created successfully!')
    console.log(`
📊 Summary:
   Tournament: ${tournament.title}
   Tournament ID: ${tournament.id}
   Venue: ${venue.name}
   Registrations: ${registrationCount} players
   Judges: ${judges.length} assigned
   Status: ${tournament.status}
   
🔗 Test URLs:
   Dashboard: http://localhost:3001/organizer/sports-india/dashboard
   Tournaments: http://localhost:3001/organizer/sports-india/tournaments
   Tournament Detail: http://localhost:3001/organizer/sports-india/tournaments/${tournament.id}
    `)

    return {
      tournament,
      venue,
      judges,
      registrationCount
    }

  } catch (error) {
    console.error('❌ Error creating sample tournament:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleTournament()
    .then(() => {
      console.log('✅ Sample data creation completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Sample data creation failed:', error)
      process.exit(1)
    })
}

export default createSampleTournament
