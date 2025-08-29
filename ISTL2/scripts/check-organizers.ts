import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOrganizers() {
  try {
    const organizers = await prisma.organizer.findMany()
    console.log('Available organizers:')
    organizers.forEach(org => {
      console.log(`- ID: ${org.id}, Name: ${org.organizationName}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrganizers()
