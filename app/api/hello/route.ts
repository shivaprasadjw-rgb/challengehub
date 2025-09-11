import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Hello from Sports India Events API!',
    status: 'success',
    timestamp: new Date().toISOString()
  })
}
