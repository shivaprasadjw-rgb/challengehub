import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Starting fix for existing data compatibility...');

    // Step 1: Check what data exists
    console.log('📝 Step 1: Checking existing data...');
    
    const existingTournaments = await prisma.$queryRaw`
      SELECT id, title, status FROM tournaments LIMIT 5
    `;
    console.log('📊 Existing tournaments:', existingTournaments);

    // Step 2: Convert existing data to work with enum types
    console.log('📝 Step 2: Converting existing data...');
    
    try {
      // First, let's see what status values exist
      const statusValues = await prisma.$queryRaw`
        SELECT DISTINCT status FROM tournaments
      `;
      console.log('📋 Existing status values:', statusValues);

      // Convert the status column to use enum type
      await prisma.$executeRawUnsafe(`
        ALTER TABLE tournaments 
        ALTER COLUMN status TYPE "TournamentStatus" 
        USING CASE 
          WHEN status = 'ACTIVE' THEN 'ACTIVE'::"TournamentStatus"
          WHEN status = 'COMPLETED' THEN 'COMPLETED'::"TournamentStatus"
          WHEN status = 'DRAFT' THEN 'DRAFT'::"TournamentStatus"
          WHEN status = 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'::"TournamentStatus"
          WHEN status = 'ARCHIVED' THEN 'ARCHIVED'::"TournamentStatus"
          WHEN status = 'CANCELLED' THEN 'CANCELLED'::"TournamentStatus"
          ELSE 'DRAFT'::"TournamentStatus"
        END
      `);
      console.log('✅ Successfully converted tournaments.status to enum');

    } catch (conversionError) {
      console.log('⚠️ Conversion failed, trying alternative approach:', conversionError);
      
      // Alternative: Drop and recreate the table with proper data
      try {
        // Get existing data first
        const allTournaments = await prisma.$queryRaw`
          SELECT * FROM tournaments
        `;
        console.log('📊 Saving existing tournament data:', allTournaments);

        // Drop the table
        await prisma.$executeRawUnsafe(`DROP TABLE tournaments CASCADE`);
        console.log('🗑️ Dropped tournaments table');

        // Recreate with enum type
        await prisma.$executeRawUnsafe(`
          CREATE TABLE tournaments (
            id TEXT NOT NULL PRIMARY KEY,
            "organizerId" TEXT NOT NULL,
            title TEXT NOT NULL,
            sport TEXT NOT NULL,
            date TIMESTAMP(3) NOT NULL,
            "entryFee" DECIMAL(10,2) NOT NULL,
            "maxParticipants" INTEGER NOT NULL DEFAULT 32,
            status "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
            "venueId" TEXT,
            "currentRound" TEXT,
            "progressionData" JSONB,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          )
        `);
        console.log('✅ Recreated tournaments table with enum types');

        // Re-insert the data with proper enum values
        if (Array.isArray(allTournaments) && allTournaments.length > 0) {
          for (const tournament of allTournaments as any[]) {
            const safeStatus = ['ACTIVE', 'COMPLETED', 'DRAFT', 'PENDING_PAYMENT', 'ARCHIVED', 'CANCELLED'].includes(tournament.status) 
              ? tournament.status 
              : 'DRAFT';
            
            await prisma.$executeRawUnsafe(`
              INSERT INTO tournaments (id, "organizerId", title, sport, date, "entryFee", "maxParticipants", status, "venueId", "currentRound", "progressionData", "createdAt", "updatedAt")
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, 
              tournament.id,
              tournament.organizerId,
              tournament.title,
              tournament.sport,
              tournament.date,
              tournament.entryFee,
              tournament.maxParticipants,
              safeStatus,
              tournament.venueId,
              tournament.currentRound,
              tournament.progressionData,
              tournament.createdAt,
              tournament.updatedAt
            );
          }
          console.log(`✅ Re-inserted ${allTournaments.length} tournaments with proper enum values`);
        }

      } catch (recreateError) {
        console.log('❌ Recreation failed:', recreateError);
        throw recreateError;
      }
    }

    // Step 3: Test the fix
    console.log('📝 Step 3: Testing the fix...');
    try {
      const tournaments = await prisma.tournament.findMany({
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      });
      
      console.log('✅ Data fix successful! Tournaments query worked:', tournaments);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Existing data fix completed successfully!',
        details: 'Existing data has been converted to work with enum types',
        testData: tournaments,
        steps: [
          'Checked existing data',
          'Converted status column to enum type',
          'Tested database queries'
        ]
      });
    } catch (testError) {
      console.error('❌ Test query failed after data fix:', testError);
      return NextResponse.json({ 
        success: false, 
        error: "Data fix completed but test query failed",
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error during existing data fix:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fix existing data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to fix existing data for enum compatibility",
    endpoint: "/api/fix-existing-data",
    method: "POST"
  });
}
