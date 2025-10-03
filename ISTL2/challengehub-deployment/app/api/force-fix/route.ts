import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Force fixing TournamentStatus enum...');

    // Step 1: Check if enum exists
    try {
      const checkResult = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'TournamentStatus'
        ) as exists
      `;
      console.log('🔍 TournamentStatus exists check:', checkResult);
    } catch (e) {
      console.log('❌ Check failed:', e instanceof Error ? e.message : String(e));
    }

    // Step 2: Drop if exists
    try {
      await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "TournamentStatus" CASCADE`);
      console.log('🗑️ Dropped TournamentStatus enum');
    } catch (e) {
      console.log('ℹ️ Drop result:', e instanceof Error ? e.message : String(e));
    }

    // Step 3: Create the enum
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED')`);
      console.log('✅ TournamentStatus enum created');
    } catch (e) {
      console.log('❌ Create failed:', e instanceof Error ? e.message : String(e));
    }

    // Step 4: Test the enum
    try {
      const testResult = await prisma.$queryRaw`
        SELECT 'ACTIVE'::"TournamentStatus" as test_enum
      `;
      console.log('🧪 Enum test result:', testResult);
    } catch (e) {
      console.log('❌ Enum test failed:', e instanceof Error ? e.message : String(e));
    }

    // Step 5: Test tournament query
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
      console.log('🎯 Active tournaments found:', tournaments.length, tournaments);
    } catch (e) {
      console.log('❌ Tournament query failed:', e instanceof Error ? e.message : String(e));
    }

    return NextResponse.json({
      success: true,
      message: "Force fix completed - check logs for details"
    });

  } catch (error) {
    console.error('❌ Error in force fix:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to force fix",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to force fix enum types",
    endpoint: "/api/force-fix",
    method: "POST"
  });
}
