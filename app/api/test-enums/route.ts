import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Testing enum types...');
    
    // First, try to check if enum types exist
    const enumCheck = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typname IN ('TournamentStatus', 'UserRole', 'Gender')
    `;
    console.log('📋 Existing enum types:', enumCheck);
    
    // Try to query tournaments with raw SQL first to avoid enum issues
    const tournamentsRaw = await prisma.$queryRaw`
      SELECT id, title, status FROM tournaments LIMIT 5
    `;
    console.log('📊 Tournaments found (raw):', tournamentsRaw);
    
    // Now try with Prisma ORM
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        title: true,
        status: true
      },
      take: 5
    });
    
    console.log('📊 Tournaments found (Prisma):', tournaments);
    
    // Test if we can filter by status
    const activeTournaments = await prisma.tournament.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log('🎯 Active tournaments:', activeTournaments);
    
    return NextResponse.json({
      success: true,
      message: "Enum test completed",
      data: {
        enumTypes: enumCheck,
        allTournaments: tournaments,
        activeTournaments: activeTournaments,
        totalCount: tournaments.length,
        activeCount: activeTournaments.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing enums:', error);
    
    // If it's an enum error, provide helpful information
    if (error instanceof Error && error.message.includes('operator does not exist')) {
      return NextResponse.json({
        success: false,
        error: "Enum types not properly configured",
        details: error.message,
        suggestion: "Call POST /api/fix-data to fix the enum issue",
        fixEndpoint: "/api/fix-data"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: false,
      error: "Failed to test enums",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
