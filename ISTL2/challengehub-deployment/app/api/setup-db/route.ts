import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔄 Starting database setup...');

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

    // Create tables with proper enum types
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT,
      "role" "UserRole" NOT NULL DEFAULT 'ORG_USER',
      "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
      "emailVerified" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "organizers" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "status" "OrganizerStatus" NOT NULL DEFAULT 'PENDING',
      "ownerUserId" TEXT NOT NULL,
      "contact" JSONB NOT NULL,
      "oneTimeFeePaidAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "venues" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizerId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "locality" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "pincode" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "tournaments" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizerId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "sport" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "entryFee" DECIMAL(10,2) NOT NULL,
      "maxParticipants" INTEGER NOT NULL DEFAULT 32,
      "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
      "venueId" TEXT,
      "currentRound" TEXT,
      "progressionData" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "user_organizers" (
      "userId" TEXT NOT NULL,
      "organizerId" TEXT NOT NULL,
      "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
      "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("userId", "organizerId")
    )`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "registrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "tournamentId" TEXT NOT NULL,
      "playerName" TEXT NOT NULL,
      "playerEmail" TEXT NOT NULL,
      "playerPhone" TEXT NOT NULL,
      "playerAge" INTEGER NOT NULL,
      "playerGender" "Gender" NOT NULL,
      "playerCategory" TEXT NOT NULL,
      "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`;

    console.log('✅ Database setup completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully!',
      details: 'All enum types and tables have been created'
    });

  } catch (error) {
    console.error('❌ Error during database setup:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to setup database",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to setup the database",
    endpoint: "/api/setup-db",
    method: "POST"
  });
}
