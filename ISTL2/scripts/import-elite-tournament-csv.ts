import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importEliteTournamentCSV() {
  try {
    console.log('📁 Importing CSV data to Elite Sports Academy tournament...');
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'data', 'elite-tournament-participants.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const participants = lines.slice(1).map(line => {
      const values = line.split(',');
      const participant: any = {};
      headers.forEach((header, index) => {
        participant[header.trim()] = values[index]?.trim();
      });
      return participant;
    });
    
    console.log(`📊 Found ${participants.length} participants in CSV`);
    
    // Find the tournament
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: 'cmezopf6n001aixc0rbqbakb4'
      },
      include: {
        organizer: true
      }
    });
    
    if (!tournament) {
      console.log('❌ Tournament not found!');
      return;
    }
    
    console.log(`🏆 Tournament: ${tournament.title}`);
    console.log(`🏢 Organizer: ${tournament.organizer.name}`);
    
    // Clear existing registrations
    const existingRegistrations = await prisma.registration.findMany({
      where: { tournamentId: tournament.id }
    });
    
    if (existingRegistrations.length > 0) {
      console.log(`🗑️ Clearing ${existingRegistrations.length} existing registrations...`);
      await prisma.registration.deleteMany({
        where: { tournamentId: tournament.id }
      });
    }
    
    // Import participants
    console.log('📝 Importing participants...');
    
    for (const participant of participants) {
      try {
        // Create user if doesn't exist
        let user = await prisma.user.findUnique({
          where: { email: participant.playerEmail }
        });
        
        if (!user) {
          const hashedPassword = await bcrypt.hash('password123', 10);
          user = await prisma.user.create({
            data: {
              email: participant.playerEmail,
              name: participant.playerName,
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
            playerName: participant.playerName,
            playerEmail: participant.playerEmail,
            playerPhone: participant.playerPhone,
            playerAge: parseInt(participant.playerAge),
            playerGender: participant.playerGender,
            playerCategory: participant.playerCategory,
            paymentStatus: participant.paymentStatus,
            registeredAt: new Date()
          }
        });
        
        console.log(`✅ Imported: ${participant.playerName} (${participant.playerEmail})`);
        
      } catch (error) {
        console.error(`❌ Failed to import ${participant.playerName}:`, error);
      }
    }
    
    // Update tournament status to ACTIVE
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: 'ACTIVE' }
    });
    
    // Verify import
    const finalRegistrations = await prisma.registration.findMany({
      where: { tournamentId: tournament.id }
    });
    
    console.log('\n🎉 CSV Import completed successfully!');
    console.log(`🏆 Tournament: ${tournament.title}`);
    console.log(`📊 Status: ACTIVE`);
    console.log(`👥 Total Registrations: ${finalRegistrations.length}`);
    console.log(`🏢 Organizer: ${tournament.organizer.name}`);
    console.log(`🔗 URL: http://localhost:3000/organizer/${tournament.organizer.slug}/tournaments/${tournament.id}`);
    
    console.log('\n👥 Imported Participants:');
    finalRegistrations.forEach((reg, index) => {
      console.log(`${index + 1}. ${reg.playerName} (${reg.playerEmail}) - ${reg.playerCategory}`);
    });
    
  } catch (error) {
    console.error('💥 Error importing CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importEliteTournamentCSV();
