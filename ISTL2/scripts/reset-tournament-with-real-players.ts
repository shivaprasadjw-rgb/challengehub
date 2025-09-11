import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetTournamentWithRealPlayers() {
  console.log('🗑️ Clearing existing registrations and adding 16 real players...')

  try {
    // Get the test tournament
    const tournament = await prisma.tournament.findFirst({
      where: { 
        title: 'Test Academy Championship 2024',
        organizerId: { not: undefined }
      }
    })

    if (!tournament) {
      console.log('❌ Test tournament not found')
      return
    }

    console.log(`✅ Found tournament: ${tournament.title}`)

    // Delete existing registrations for this tournament
    await prisma.registration.deleteMany({
      where: { tournamentId: tournament.id }
    })

    console.log('🗑️ Cleared existing registrations')

    // Real player names with diverse backgrounds
    const realPlayers = [
      { name: 'Arjun Patel', email: 'arjun.patel@email.com', category: 'ADVANCED', age: 28, gender: 'MALE' },
      { name: 'Priya Sharma', email: 'priya.sharma@email.com', category: 'INTERMEDIATE', age: 25, gender: 'FEMALE' },
      { name: 'Vikram Singh', email: 'vikram.singh@email.com', category: 'ADVANCED', age: 30, gender: 'MALE' },
      { name: 'Ananya Reddy', email: 'ananya.reddy@email.com', category: 'BEGINNER', age: 22, gender: 'FEMALE' },
      { name: 'Rohit Kumar', email: 'rohit.kumar@email.com', category: 'INTERMEDIATE', age: 27, gender: 'MALE' },
      { name: 'Sneha Agarwal', email: 'sneha.agarwal@email.com', category: 'ADVANCED', age: 29, gender: 'FEMALE' },
      { name: 'Karan Mehta', email: 'karan.mehta@email.com', category: 'BEGINNER', age: 24, gender: 'MALE' },
      { name: 'Divya Nair', email: 'divya.nair@email.com', category: 'INTERMEDIATE', age: 26, gender: 'FEMALE' },
      { name: 'Aadhya Gupta', email: 'aadhya.gupta@email.com', category: 'ADVANCED', age: 31, gender: 'FEMALE' },
      { name: 'Ravi Joshi', email: 'ravi.joshi@email.com', category: 'INTERMEDIATE', age: 28, gender: 'MALE' },
      { name: 'Ishaan Verma', email: 'ishaan.verma@email.com', category: 'BEGINNER', age: 23, gender: 'MALE' },
      { name: 'Kavya Iyer', email: 'kavya.iyer@email.com', category: 'ADVANCED', age: 27, gender: 'FEMALE' },
      { name: 'Manish Bansal', email: 'manish.bansal@email.com', category: 'INTERMEDIATE', age: 32, gender: 'MALE' },
      { name: 'Tanya Kapoor', email: 'tanya.kapoor@email.com', category: 'BEGINNER', age: 21, gender: 'FEMALE' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@email.com', category: 'ADVANCED', age: 29, gender: 'MALE' },
      { name: 'Meera Soni', email: 'meera.soni@email.com', category: 'INTERMEDIATE', age: 26, gender: 'FEMALE' }
    ]

    console.log('👥 Creating 16 real players...')

    for (let i = 0; i < realPlayers.length; i++) {
      const player = realPlayers[i]
      
      // Create or get user
      let user = await prisma.user.findUnique({
        where: { email: player.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: player.email,
            name: player.name,
            role: 'PLAYER',
            status: 'ACTIVE'
          }
        })
      }

      // Create registration
      await prisma.registration.create({
        data: {
          tournamentId: tournament.id,
          playerName: player.name,
          playerEmail: player.email,
          playerPhone: `+91-${9000000000 + i}`, // Generate unique phone numbers
          playerAge: player.age,
          playerGender: player.gender as 'MALE' | 'FEMALE',
          playerCategory: player.category,
          paymentStatus: 'SUCCEEDED',
          registeredAt: new Date(Date.now() - (i * 60000)) // Staggered registration times
        }
      })

      console.log(`  ✅ ${i + 1}/16: ${player.name} (${player.category})`)
    }

    // Get final count
    const finalCount = await prisma.registration.count({
      where: { tournamentId: tournament.id }
    })

    console.log('\n🎯 TOURNAMENT READY FOR TESTING!')
    console.log('================================')
    console.log(`Tournament: ${tournament.title}`)
    console.log(`Total Registrations: ${finalCount}/16`)
    console.log(`Status: ${tournament.status}`)
    console.log('\n👥 REGISTERED PLAYERS:')
    realPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} - ${player.category}`)
    })

    console.log('\n🚀 NEXT STEPS:')
    console.log('==============')
    console.log('1. Visit tournament page to see real player names')
    console.log('2. Initialize tournament progression')
    console.log('3. Test the complete bracket system')
    console.log(`\nTournament URL: http://localhost:3000/organizer/test-sports-academy/tournaments/${tournament.id}`)

  } catch (error) {
    console.error('❌ Error resetting tournament data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetTournamentWithRealPlayers()
