import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔄 Starting database migration...');

    // Push the schema to the database
    const { execSync } = require('child_process');
    
    // Run prisma db push to create tables
    execSync('npx prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.log('✅ Database migration completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully!',
      details: 'All tables have been created'
    });

  } catch (error) {
    console.error('❌ Error during migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to migrate database",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Use POST method to migrate the database",
    endpoint: "/api/migrate",
    method: "POST"
  });
}
