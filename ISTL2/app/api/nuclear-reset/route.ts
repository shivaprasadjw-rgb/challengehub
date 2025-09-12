import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('💥 Starting NUCLEAR database reset...');

    // Step 1: Drop ALL tables and types
    console.log('📝 Step 1: Dropping ALL database objects...');
    
    const { execSync } = require('child_process');
    
    try {
      // Use prisma db push with force reset
      execSync('npx prisma db push --force-reset --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database completely reset!');
    } catch (resetError) {
      console.log('❌ Prisma reset failed, trying manual approach:', resetError);
      
      // Manual approach - drop everything
      const enumTypes = [
        'UserRole', 'UserStatus', 'OrganizerStatus', 'ApplicationStatus',
        'MembershipRole', 'TournamentStatus', 'Gender', 'PaymentType',
        'PaymentStatus', 'MatchStatus'
      ];

      // Drop all enum types
      for (const enumType of enumTypes) {
        try {
          await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "${enumType}" CASCADE`);
          console.log(`🗑️ Dropped ${enumType}`);
        } catch (e) {
          console.log(`⚠️ Error dropping ${enumType}:`, e);
        }
      }

      // Drop all tables
      const tables = [
        'matches', 'tournament_rounds', 'registrations', 'judge_assignments',
        'judges', 'payments', 'audit_logs', 'user_organizers', 
        'organizer_applications', 'tournaments', 'venues', 'organizers', 'users'
      ];

      for (const table of tables) {
        try {
          await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`🗑️ Dropped table ${table}`);
        } catch (e) {
          console.log(`⚠️ Error dropping table ${table}:`, e);
        }
      }
    }

    // Step 2: Recreate everything from scratch
    console.log('📝 Step 2: Recreating database from scratch...');
    
    try {
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database recreated successfully!');
    } catch (pushError) {
      console.log('❌ Recreation failed:', pushError);
      throw pushError;
    }

    // Step 3: Test the reset
    console.log('📝 Step 3: Testing the reset...');
    try {
      const tournaments = await prisma.tournament.findMany({
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      });
      
      console.log('✅ Nuclear reset successful! Database is clean and working:', tournaments);
      
      return NextResponse.json({ 
        success: true, 
        message: 'NUCLEAR RESET completed successfully!',
        details: 'Database has been completely wiped and recreated',
        testData: tournaments,
        warning: 'ALL DATA HAS BEEN LOST - Database is now empty but functional'
      });
    } catch (testError) {
      console.error('❌ Test query failed after nuclear reset:', testError);
      return NextResponse.json({ 
        success: false, 
        error: "Nuclear reset completed but test query failed",
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error during nuclear reset:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to nuclear reset database",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to NUCLEAR RESET the database (WARNING: This will delete ALL data)",
    endpoint: "/api/nuclear-reset",
    method: "POST",
    warning: "This will completely wipe your database!"
  });
}
