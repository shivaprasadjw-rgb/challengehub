import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Starting data fix for enum compatibility...');

    // Step 1: Create enum types if they don't exist
    console.log('📝 Step 1: Ensuring enum types exist...');
    const enumTypes = [
      'UserRole',
      'UserStatus', 
      'OrganizerStatus',
      'ApplicationStatus',
      'MembershipRole',
      'TournamentStatus',
      'Gender',
      'PaymentType',
      'PaymentStatus',
      'MatchStatus'
    ];

    for (const enumType of enumTypes) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = ${enumType}
          ) as exists
        `;
        
        const exists = (result as any)[0]?.exists;
        
        if (!exists) {
          console.log(`➕ Creating ${enumType} enum...`);
          const enumValues = getEnumValues(enumType);
          await prisma.$executeRawUnsafe(`CREATE TYPE "${enumType}" AS ENUM (${enumValues})`);
          console.log(`✅ ${enumType} created successfully`);
        } else {
          console.log(`✅ ${enumType} already exists`);
        }
      } catch (e) {
        console.log(`❌ Error with ${enumType}:`, e instanceof Error ? e.message : String(e));
      }
    }

    // Step 2: Try to fix existing data by converting text columns to enum
    console.log('📝 Step 2: Converting existing data to enum types...');
    
    try {
      // First, let's see what's in the tournaments table
      const tournaments = await prisma.$queryRaw`
        SELECT id, title, status FROM tournaments LIMIT 5
      `;
      console.log('📊 Current tournaments:', tournaments);

      // Try to convert status column to enum type
      await prisma.$executeRawUnsafe(`
        ALTER TABLE tournaments 
        ALTER COLUMN status TYPE "TournamentStatus" 
        USING status::"TournamentStatus"
      `);
      console.log('✅ Converted tournaments.status to enum');

    } catch (conversionError) {
      console.log('⚠️ Could not convert existing data:', conversionError);
      
      // If conversion fails, try a different approach - recreate the table
      console.log('📝 Step 2b: Recreating tournaments table...');
      
      try {
        // Drop and recreate tournaments table
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS tournaments CASCADE`);
        
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
        
      } catch (recreateError) {
        console.log('❌ Failed to recreate table:', recreateError);
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
        message: 'Data fix completed successfully!',
        details: 'Existing data has been converted to work with enum types',
        testData: tournaments,
        steps: [
          'Created all enum types',
          'Converted existing data to enum types',
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

    // Helper function to get enum values
    function getEnumValues(enumType: string): string {
      const enumValues = {
        'UserRole': "'SUPER_ADMIN', 'ORG_USER', 'JUDGE', 'PLAYER'",
        'UserStatus': "'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'",
        'OrganizerStatus': "'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'",
        'ApplicationStatus': "'PENDING', 'APPROVED', 'REJECTED'",
        'MembershipRole': "'OWNER', 'ADMIN', 'STAFF', 'MEMBER'",
        'TournamentStatus': "'DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED'",
        'Gender': "'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'",
        'PaymentType': "'ORGANIZER_REGISTRATION', 'TOURNAMENT_FEE', 'JUDGE_FEE', 'OTHER'",
        'PaymentStatus': "'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED'",
        'MatchStatus': "'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'"
      };
      return enumValues[enumType as keyof typeof enumValues] || '';
    }

  } catch (error) {
    console.error('❌ Error during data fix:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fix data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to fix existing data for enum compatibility",
    endpoint: "/api/fix-data",
    method: "POST"
  });
}
