import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Force creating enum types...');

    // Force create TournamentStatus enum (the one we need most)
    try {
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "TournamentStatus" CASCADE`);
      console.log('🗑️ Dropped existing TournamentStatus enum');
    } catch (e) {
      console.log('ℹ️ No existing TournamentStatus enum to drop');
    }

    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED')`);
      console.log('✅ TournamentStatus enum created successfully');
    } catch (e) {
      console.log('❌ Failed to create TournamentStatus:', e instanceof Error ? e.message : String(e));
    }

    // Test if it works
    try {
      const testResult = await prisma.$queryRaw`
        SELECT 'ACTIVE'::"TournamentStatus" as test_enum
      `;
      console.log('🧪 Enum test result:', testResult);
    } catch (e) {
      console.log('❌ Enum test failed:', e instanceof Error ? e.message : String(e));
    }

    // Test tournaments query
    try {
      const tournaments = await prisma.tournament.findMany({
        where: {
          status: 'ACTIVE'
        },
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 3
      });
      console.log('🎯 Active tournaments found:', tournaments.length);
    } catch (e) {
      console.log('❌ Tournament query failed:', e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json({
      success: true,
      message: "Enum fix attempt completed",
      details: "Check logs for results"
    });

  } catch (error) {
    console.error('❌ Error fixing enums:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to fix enums",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to fix enum types",
    endpoint: "/api/fix-enums",
    method: "POST"
  });
}
