import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('📥 Starting clean data import to production...');

    // Read the exported clean data
    const exportsDir = path.join(process.cwd(), 'exports');
    const exportFiles = fs.readdirSync(exportsDir).filter(file => file.startsWith('clean-data-'));
    
    if (exportFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No clean data export found. Please export clean data first.'
      }, { status: 400 });
    }

    // Use the most recent export
    const latestExport = exportFiles.sort().pop();
    const exportPath = path.join(exportsDir, latestExport!);
    const cleanData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    console.log(`📂 Using export file: ${latestExport}`);

    // Import data in correct order (respecting foreign key constraints)
    
    // 1. Import organizers first
    console.log('📝 Importing organizers...');
    for (const organizer of cleanData.organizers) {
      await prisma.organizer.create({
        data: {
          id: organizer.id,
          name: organizer.name,
          slug: organizer.slug,
          status: organizer.status,
          ownerUserId: organizer.ownerUserId,
          contact: organizer.contact,
          oneTimeFeePaidAt: organizer.oneTimeFeePaidAt ? new Date(organizer.oneTimeFeePaidAt) : null,
          createdAt: new Date(organizer.createdAt),
          updatedAt: new Date(organizer.updatedAt)
        }
      });
    }

    // 2. Import venues
    console.log('📝 Importing venues...');
    for (const venue of cleanData.venues) {
      await prisma.venue.create({
        data: {
          id: venue.id,
          organizerId: venue.organizerId,
          name: venue.name,
          locality: venue.locality,
          city: venue.city,
          state: venue.state,
          pincode: venue.pincode,
          address: venue.address,
          createdAt: new Date(venue.createdAt),
          updatedAt: new Date(venue.updatedAt)
        }
      });
    }

    // 3. Import tournaments
    console.log('📝 Importing tournaments...');
    for (const tournament of cleanData.tournaments) {
      await prisma.tournament.create({
        data: {
          id: tournament.id,
          organizerId: tournament.organizerId,
          title: tournament.title,
          sport: tournament.sport,
          date: new Date(tournament.date),
          entryFee: tournament.entryFee,
          maxParticipants: tournament.maxParticipants,
          status: tournament.status,
          venueId: tournament.venueId,
          currentRound: tournament.currentRound,
          progressionData: tournament.progressionData,
          createdAt: new Date(tournament.createdAt),
          updatedAt: new Date(tournament.updatedAt)
        }
      });
    }

    // 4. Import registrations
    console.log('📝 Importing registrations...');
    for (const registration of cleanData.registrations) {
      await prisma.registration.create({
        data: {
          id: registration.id,
          tournamentId: registration.tournamentId,
          playerName: registration.playerName,
          playerEmail: registration.playerEmail,
          playerPhone: registration.playerPhone,
          playerAge: registration.playerAge,
          playerGender: registration.playerGender,
          playerCategory: registration.playerCategory,
          paymentStatus: registration.paymentStatus,
          registeredAt: new Date(registration.registeredAt)
        }
      });
    }

    // 5. Import judges
    console.log('📝 Importing judges...');
    for (const judge of cleanData.judges) {
      await prisma.judge.create({
        data: {
          id: judge.id,
          organizerId: judge.organizerId,
          fullName: judge.fullName,
          gender: judge.gender,
          categories: judge.categories,
          phone: judge.phone,
          email: judge.email,
          bio: judge.bio,
          createdAt: new Date(judge.createdAt),
          updatedAt: new Date(judge.updatedAt)
        }
      });
    }

    // 6. Import payments
    console.log('📝 Importing payments...');
    for (const payment of cleanData.payments) {
      await prisma.payment.create({
        data: {
          id: payment.id,
          organizerId: payment.organizerId,
          tournamentId: payment.tournamentId,
          amount: payment.amount,
          currency: payment.currency,
          type: payment.type,
          status: payment.status,
          gatewayRef: payment.gatewayRef,
          stripeSessionId: payment.stripeSessionId,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          createdAt: new Date(payment.createdAt),
          updatedAt: new Date(payment.updatedAt)
        }
      });
    }

    // 7. Import audit logs
    console.log('📝 Importing audit logs...');
    for (const auditLog of cleanData.auditLogs) {
      await prisma.auditLog.create({
        data: {
          id: auditLog.id,
          actorUserId: auditLog.actorUserId,
          organizerId: auditLog.organizerId,
          action: auditLog.action,
          entityType: auditLog.entityType,
          entityId: auditLog.entityId,
          tournamentId: auditLog.tournamentId,
          paymentId: auditLog.paymentId,
          meta: auditLog.meta,
          createdAt: new Date(auditLog.createdAt)
        }
      });
    }

    console.log('✅ Clean data import completed!');

    // Get final counts
    const counts = await Promise.all([
      prisma.tournament.count(),
      prisma.organizer.count(),
      prisma.venue.count(),
      prisma.registration.count(),
      prisma.judge.count(),
      prisma.payment.count(),
      prisma.auditLog.count()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Clean data import completed successfully',
      imported: {
        tournaments: counts[0],
        organizers: counts[1],
        venues: counts[2],
        registrations: counts[3],
        judges: counts[4],
        payments: counts[5],
        auditLogs: counts[6]
      },
      sourceFile: latestExport
    });

  } catch (error) {
    console.error('❌ Error during data import:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to import clean data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to import clean data to production",
    endpoint: "/api/import-clean-data",
    method: "POST",
    note: "Make sure you have exported clean data first using the export script"
  });
}
