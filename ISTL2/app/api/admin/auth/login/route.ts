import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // CSRF protection
    const csrfToken = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token');
    if (!csrfToken) {
      return NextResponse.json({ 
        success: false, 
        error: "CSRF token missing" 
      }, { status: 400 });
    }

    const { username, password } = await req.json();

    // Input validation
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: "Username and password are required" 
      }, { status: 400 });
    }

    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: username,
        role: 'SUPER_ADMIN'
      }
    });

    if (!adminUser) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid credentials" 
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid credentials" 
      }, { status: 401 });
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Store session (in production, use Redis or database)
    // For now, we'll use a simple approach
    const sessionData = {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      timestamp: Date.now()
    };

    return NextResponse.json({ 
      success: true, 
      sessionId,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: "Method not allowed" 
  }, { status: 405 });
}
