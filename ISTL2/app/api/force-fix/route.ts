import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive force fix for deployment...');

    // Step 1: Drop existing enum types if they exist (to avoid conflicts)
    console.log('📝 Step 1: Cleaning up existing enum types...');
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
        // Check if enum exists
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = ${enumType}
          ) as exists
        `;
        
        const exists = (result as any)[0]?.exists;
        
        if (exists) {
          console.log(`🗑️ Dropping existing ${enumType} enum...`);
          await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
          console.log(`✅ ${enumType} dropped successfully`);
        }
      } catch (e) {
        console.log(`⚠️ Error dropping ${enumType}:`, e instanceof Error ? e.message : String(e));
      }
    }

    // Step 2: Create fresh enum types
    console.log('📝 Step 2: Creating fresh enum types...');
    for (const enumType of enumTypes) {
      try {
        console.log(`➕ Creating ${enumType} enum...`);
        const enumValues = getEnumValues(enumType);
        await prisma.$executeRawUnsafe(`CREATE TYPE "${enumType}" AS ENUM (${enumValues})`);
        console.log(`✅ ${enumType} created successfully`);
      } catch (e) {
        console.log(`❌ Error creating ${enumType}:`, e instanceof Error ? e.message : String(e));
      }
    }

    // Step 3: Drop and recreate tables to ensure proper enum usage
    console.log('📝 Step 3: Recreating tables with proper enum types...');
    
    // Drop tables in reverse dependency order
    const tablesToDrop = [
      'matches',
      'tournament_rounds', 
      'registrations',
      'judge_assignments',
      'judges',
      'payments',
      'audit_logs',
      'user_organizers',
      'organizer_applications',
      'tournaments',
      'venues',
      'organizers',
      'users'
    ];

    for (const table of tablesToDrop) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`🗑️ Dropped table ${table}`);
      } catch (e) {
        console.log(`⚠️ Error dropping table ${table}:`, e instanceof Error ? e.message : String(e));
      }
    }

    // Step 4: Run prisma db push to recreate everything properly
    console.log('📝 Step 4: Running prisma db push...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Prisma db push completed successfully!');
    } catch (pushError) {
      console.log('❌ Prisma db push failed:', pushError);
      throw pushError;
    }

    // Step 5: Test the fix
    console.log('📝 Step 5: Testing the fix...');
    try {
      const tournaments = await prisma.tournament.findMany({
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      });
      
      console.log('✅ Comprehensive force fix successful! Tournaments query worked:', tournaments);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Comprehensive force fix completed successfully!',
        details: 'Database has been completely rebuilt with proper enum types',
        testData: tournaments,
        steps: [
          'Dropped existing enum types',
          'Created fresh enum types',
          'Dropped all tables',
          'Ran prisma db push to recreate schema',
          'Tested database queries'
        ]
      });
    } catch (testError) {
      console.error('❌ Test query failed after comprehensive fix:', testError);
      return NextResponse.json({ 
        success: false, 
        error: "Comprehensive fix completed but test query failed",
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
    console.error('❌ Error during comprehensive force fix:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to comprehensively fix database",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to comprehensively force fix the database",
    endpoint: "/api/force-fix",
    method: "POST"
  });
}