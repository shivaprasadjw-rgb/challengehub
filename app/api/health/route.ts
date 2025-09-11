import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Sports India Events API is running!',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}
