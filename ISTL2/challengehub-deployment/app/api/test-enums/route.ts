import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 Testing enum types...');
    
    // Test if we can query tournaments with enum values
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        title: true,
        status: true
      },
      take: 5
    });
    
    console.log('📊 Tournaments found:', tournaments);
    
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
        allTournaments: tournaments,
        activeTournaments: activeTournaments,
        totalCount: tournaments.length,
        activeCount: activeTournaments.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing enums:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to test enums",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
