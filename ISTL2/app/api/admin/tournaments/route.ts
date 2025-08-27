import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


function validateTournamentData(data: any): { isValid: boolean; errors: string[]; sanitized?: any } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.title || data.title.length < 3 || data.title.length > 100) {
    errors.push("Title must be between 3 and 100 characters");
  }
  
  if (!data.sport || data.sport.length < 2 || data.sport.length > 50) {
    errors.push("Sport must be between 2 and 50 characters");
  }
  
  if (!data.venueId) {
    errors.push("Venue is required");
  }
  
  // Validate max participants
  if (data.maxParticipants && (data.maxParticipants < 1 || data.maxParticipants > 1000)) {
    errors.push("Maximum participants must be between 1 and 1000");
  }

  // Validate entry fee
  const entryFee = parseInt(data.entryFee);
  if (isNaN(entryFee) || entryFee < 0 || entryFee > 10000) {
    errors.push("Entry fee must be a valid number between 0 and 10000");
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Sanitize and prepare data
  const sanitized = {
    title: data.title?.trim(),
    sport: data.sport?.trim(),
    date: data.date ? new Date(data.date) : undefined,
    entryFee: entryFee,
    maxParticipants: data.maxParticipants || 32,
    description: data.description?.trim() || "",
    status: data.status || "PENDING",
    venueId: data.venueId,
  };
  
  return { isValid: true, errors: [], sanitized };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tournaments = await prisma.tournament.findMany({
      include: {
        venue: true,
        registrations: {
          select: {
            id: true
          }
        }
      }
    });

    const tournamentsWithCounts = tournaments.map(tournament => ({
      ...tournament,
      currentParticipants: tournament.registrations.length
    }));

    return NextResponse.json({ success: true, tournaments: tournamentsWithCounts });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ success: false, error: "Failed to fetch tournaments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await req.json();
    const validation = validateTournamentData(payload);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }
    
    const tournamentData = validation.sanitized!;
    
    // Create tournament with default organizer (Sports India)
    const tournament = await prisma.tournament.create({
      data: {
        ...tournamentData,
        organizerId: 'default-organizer-id', // You'll need to set this properly
        status: 'PENDING'
      },
      include: {
        venue: true
      }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resourceType: 'TOURNAMENT',
        resourceId: tournament.id,
        details: { title: tournament.title, sport: tournament.sport }
      }
    });
    
    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ success: false, error: "Failed to create tournament" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing tournament id" }, { status: 400 });
    
    const payload = await req.json();
    const validation = validateTournamentData(payload);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }
    
    const tournamentData = validation.sanitized!;
    
    const updated = await prisma.tournament.update({
      where: { id },
      data: tournamentData,
      include: {
        venue: true
      }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resourceType: 'TOURNAMENT',
        resourceId: id,
        details: { title: updated.title, sport: updated.sport }
      }
    });
    
    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ success: false, error: "Failed to update tournament" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing tournament id" }, { status: 400 });
    
    await prisma.tournament.delete({
      where: { id }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resourceType: 'TOURNAMENT',
        resourceId: id,
        details: { archived: true }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ success: false, error: "Failed to delete tournament" }, { status: 500 });
  }
}
