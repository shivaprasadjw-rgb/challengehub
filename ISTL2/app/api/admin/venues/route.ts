import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate venue data with security checks
function validateVenueData(data: any): { isValid: boolean; errors: string[]; sanitized?: any } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push("Name must be between 2 and 100 characters");
  }
  
  if (!data.locality || data.locality.length < 2 || data.locality.length > 100) {
    errors.push("Locality must be between 2 and 100 characters");
  }
  
  if (!data.city || data.city.length < 2 || data.city.length > 100) {
    errors.push("City must be between 2 and 100 characters");
  }
  
  if (!data.state || data.state.length < 2 || data.state.length > 100) {
    errors.push("State must be between 2 and 100 characters");
  }
  
  if (!data.pincode || data.pincode.length < 6 || data.pincode.length > 10) {
    errors.push("Pincode must be between 6 and 10 characters");
  }

  // Validate pincode format (basic Indian pincode validation)
  if (data.pincode && !/^\d{6}$/.test(data.pincode)) {
    errors.push("Pincode must be exactly 6 digits");
  }

  // Validate coordinates if provided
  if (data.lat) {
    const lat = parseFloat(data.lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push("Latitude must be a valid number between -90 and 90");
    }
  }

  if (data.lng) {
    const lng = parseFloat(data.lng);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push("Longitude must be a valid number between -180 and 180");
    }
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Sanitize and prepare data
  const sanitized = {
    name: data.name?.trim(),
    locality: data.locality?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim(),
    pincode: data.pincode?.trim(),
    lat: data.lat ? parseFloat(data.lat) : null,
    lng: data.lng ? parseFloat(data.lng) : null,
    address: data.address?.trim() || ""
  };
  
  return { isValid: true, errors: [], sanitized };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const venues = await prisma.venue.findMany();
    return NextResponse.json({ success: true, venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ success: false, error: "Failed to fetch venues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await req.json();
    const validation = validateVenueData(payload);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }
    
    const venueData = validation.sanitized!;
    
    const venue = await prisma.venue.create({
      data: venueData
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'CREATE',
        entityType: 'VENUE',
        entityId: venue.id,
        meta: { name: venue.name, city: venue.city, state: venue.state }
      }
    });
    
    return NextResponse.json({ success: true, venue });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json({ success: false, error: "Failed to create venue" }, { status: 500 });
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
    if (!id) return NextResponse.json({ success: false, error: "Missing venue id" }, { status: 400 });
    
    const payload = await req.json();
    const validation = validateVenueData(payload);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }
    
    const venueData = validation.sanitized!;
    
    const updated = await prisma.venue.update({
      where: { id },
      data: venueData
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'UPDATE',
        entityType: 'VENUE',
        entityId: id,
        meta: { name: updated.name, city: updated.city, state: updated.state }
      }
    });
    
    return NextResponse.json({ success: true, venue: updated });
  } catch (error) {
    console.error('Error updating venue:', error);
    return NextResponse.json({ success: false, error: "Failed to update venue" }, { status: 500 });
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
    if (!id) return NextResponse.json({ success: false, error: "Missing venue id" }, { status: 400 });
    
    await prisma.venue.delete({
      where: { id }
    });
    
    // Log audit
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: 'DELETE',
        entityType: 'VENUE',
        entityId: id,
        meta: { archived: true }
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json({ success: false, error: "Failed to delete venue" }, { status: 500 });
  }
}
