import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ success: true, venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ success: false, error: "Failed to fetch venues" }, { status: 500 });
  }
}
