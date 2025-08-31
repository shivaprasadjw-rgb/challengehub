import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        organizer: true,
        registrations: true
      }
    })

    console.log('🏆 All Tournaments:')
    tournaments.forEach(t => {
      console.log(`ID: ${t.id}`)
      console.log(`Title: ${t.title}`)
      console.log(`Organizer: ${t.organizer.slug}`)
      console.log(`Registrations: ${t.registrations.length}`)
      console.log(`Status: ${t.status}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTournaments()
