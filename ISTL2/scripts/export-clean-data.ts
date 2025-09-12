import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportCleanData() {
  try {
    console.log('📤 Exporting clean data from local database...');

    // Export all data
    const data = {
      tournaments: await prisma.tournament.findMany({
        include: {
          organizer: true,
          venue: true,
          registrations: true
        }
      }),
      organizers: await prisma.organizer.findMany({
        include: {
          venues: true,
          tournaments: true
        }
      }),
      venues: await prisma.venue.findMany(),
      registrations: await prisma.registration.findMany(),
      users: await prisma.user.findMany(),
      judges: await prisma.judge.findMany(),
      payments: await prisma.payment.findMany(),
      auditLogs: await prisma.auditLog.findMany()
    };

    // Create exports directory
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Export to JSON file
    const exportFile = path.join(exportsDir, `clean-data-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(data, null, 2));

    console.log(`✅ Data exported to: ${exportFile}`);
    console.log('📊 Export summary:');
    console.log(`- Tournaments: ${data.tournaments.length}`);
    console.log(`- Organizers: ${data.organizers.length}`);
    console.log(`- Venues: ${data.venues.length}`);
    console.log(`- Registrations: ${data.registrations.length}`);
    console.log(`- Users: ${data.users.length}`);
    console.log(`- Judges: ${data.judges.length}`);
    console.log(`- Payments: ${data.payments.length}`);
    console.log(`- Audit Logs: ${data.auditLogs.length}`);

    return exportFile;

  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportCleanData();
