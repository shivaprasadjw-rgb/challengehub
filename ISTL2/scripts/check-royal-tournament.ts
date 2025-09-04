import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRoyalTournament() {
  console.log('🔍 Checking Royal Tournament details...')

  try {
    // Find the Royal Tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        title: {
          contains: 'Royal'
        }
      },
      include: {
        organizer: true,
        venue: true,
        registrations: true,
        rounds: {
          include: {
            matches: true
          }
        }
      }
    })

    if (tournament) {
      console.log('\n🏆 Royal Tournament Found:')
      console.log(`ID: ${tournament.id}`)
      console.log(`Title: ${tournament.title}`)
      console.log(`Status: ${tournament.status}`)
      console.log(`Current Round: ${tournament.currentRound}`)
      console.log(`Organizer: ${tournament.organizer.name}`)
      console.log(`Venue: ${tournament.venue?.name || 'No venue'}`)
      console.log(`Registrations: ${tournament.registrations.length}`)
      console.log(`Rounds: ${tournament.rounds.length}`)
      
      console.log('\n🔗 Public URL:')
      console.log(`http://localhost:3000/tournament/${tournament.id}`)
      
      console.log('\n🔗 Organizer URL:')
      console.log(`http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments/${tournament.id}`)
      
      console.log('\n🔗 API Endpoint:')
      console.log(`http://localhost:3000/api/tournaments/${tournament.id}`)
      
      if (tournament.rounds.length > 0) {
        console.log('\n📊 Rounds:')
        tournament.rounds.forEach((round, index) => {
          console.log(`${index + 1}. ${round.name} - ${round.isCompleted ? 'Completed' : 'In Progress'} (${round.matches.length} matches)`)
        })
      }
    } else {
      console.log('❌ Royal Tournament not found!')
    }

  } catch (error) {
    console.error('❌ Error checking Royal Tournament:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRoyalTournament()
