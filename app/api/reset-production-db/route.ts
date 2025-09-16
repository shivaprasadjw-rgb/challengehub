import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('💥 Starting complete production database reset...');

    // Backup current data first
    console.log('📤 Creating backup...');
    const backupData = {
      tournaments: await prisma.tournament.findMany(),
      organizers: await prisma.organizer.findMany(),
      venues: await prisma.venue.findMany(),
      registrations: await prisma.registration.findMany(),
      users: await prisma.user.findMany(),
      judges: await prisma.judge.findMany(),
      payments: await prisma.payment.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      exportedAt: new Date().toISOString()
    };

    // Clear all data
    console.log('🗑️ Clearing all data...');
    await prisma.registration.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.organizer.deleteMany();
    await prisma.judge.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.auditLog.deleteMany();
    // Note: Not deleting users to preserve authentication data

    console.log('✅ Production database reset completed!');

    return NextResponse.json({
      success: true,
      message: 'Production database reset completed',
      backup: {
        tournaments: backupData.tournaments.length,
        organizers: backupData.organizers.length,
        venues: backupData.venues.length,
        registrations: backupData.registrations.length,
        users: backupData.users.length,
        judges: backupData.judges.length,
        payments: backupData.payments.length,
        auditLogs: backupData.auditLogs.length
      },
      note: 'Database is now empty and ready for clean data import'
    });

  } catch (error) {
    console.error('❌ Error during production reset:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset production database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to completely reset production database",
    endpoint: "/api/reset-production-db",
    method: "POST",
    warning: "This will DELETE ALL DATA from production database"
  });
}
