import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tournamentId, deadline } = await req.json();

    if (!tournamentId || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { registrationDeadline: new Date(deadline) }
    });

    return NextResponse.json({ success: true, tournament: updatedTournament });
  } catch (error) {
    console.error('Error updating tournament deadline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
