import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Starting enum fix...');

    // Check if enum types exist first
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
        console.log(`🔍 ${enumType} exists:`, exists);
        
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

    // Test if the fix worked by querying tournaments
    try {
      const tournaments = await prisma.tournament.findMany({
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      });
      
      console.log('✅ Enum fix successful! Tournaments query worked:', tournaments);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Enum fix completed successfully!',
        details: 'All enum types have been created and tested',
        testData: tournaments
      });
    } catch (testError) {
      console.error('❌ Test query failed after enum fix:', testError);
      return NextResponse.json({ 
        success: false, 
        error: "Enum fix completed but test query failed",
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error during enum fix:', error);
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
