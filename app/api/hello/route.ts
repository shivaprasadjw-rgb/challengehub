import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from Sports India Events API!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Hello from POST endpoint!',
      received: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      status: 'error'
    }, { status: 400 });
  }
}
