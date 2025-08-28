import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import csv from 'csv-parser'
import { Readable } from 'stream'

interface BulkRegistrationData {
  playerName: string
  playerEmail: string
  playerPhone: string
  playerAge: number
  playerGender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  playerCategory: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === params.slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Check if tournament exists and belongs to this organizer
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: params.id,
        organizerId: organizer.id
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      return await handleFileUpload(req, params.id, session.user.name || 'Unknown')
    } else {
      // Handle JSON data
      return await handleJSONData(req, params.id, session.user.name || 'Unknown')
    }

  } catch (error) {
    console.error('Error in bulk registration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleJSONData(req: NextRequest, tournamentId: string, adminUser: string) {
  try {
    const { registrations } = await req.json()

    if (!Array.isArray(registrations) || registrations.length === 0) {
      return NextResponse.json({ error: 'Invalid registration data' }, { status: 400 })
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i]
      try {
        // Validate required fields
        const validation = validateRegistrationData(registration, i + 1)
        if (!validation.isValid) {
          results.failed++
          results.errors.push(...validation.errors)
          continue
        }

        // Check if user already registered
        const existingRegistration = await prisma.registration.findFirst({
          where: {
            tournamentId,
            playerEmail: registration.playerEmail
          }
        })

        if (existingRegistration) {
          results.failed++
          results.errors.push(`Row ${i + 1}: Player ${registration.playerEmail} is already registered`)
          continue
        }

        // Create or get user first (since Registration has foreign key to User)
        const email = registration.playerEmail.trim().toLowerCase()
        let user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: registration.playerName.trim(),
              role: 'PLAYER'
            }
          })
        }

        // Create registration
        await prisma.registration.create({
          data: {
            tournamentId,
            playerName: registration.playerName.trim(),
            playerEmail: email,
            playerPhone: registration.playerPhone.trim(),
            playerAge: parseInt(registration.playerAge.toString()),
            playerGender: registration.playerGender,
            playerCategory: registration.playerCategory.trim(),
            paymentStatus: 'PENDING'
          }
        })

        results.successful++

      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        organizerId: null,
        action: 'BULK_REGISTRATION_IMPORT',
        entityType: 'Tournament',
        entityId: tournamentId,
        tournamentId: tournamentId,
        meta: {
          totalProcessed: registrations.length,
          successful: results.successful,
          failed: results.failed,
          adminUser
        }
      }
    })

    return NextResponse.json({
      message: 'Bulk registration processed',
      results
    })

  } catch (error) {
    console.error('Error processing JSON data:', error)
    return NextResponse.json(
      { error: 'Failed to process registration data' },
      { status: 500 }
    )
  }
}

async function handleFileUpload(req: NextRequest, tournamentId: string, adminUser: string) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 })
    }

    // Parse CSV file
    const fileBuffer = await file.arrayBuffer()
    const fileString = new TextDecoder().decode(fileBuffer)
    
    const registrations: BulkRegistrationData[] = []
    const stream = Readable.from([fileString])

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => {
          registrations.push({
            playerName: data.playerName || data.name || '',
            playerEmail: data.playerEmail || data.email || '',
            playerPhone: data.playerPhone || data.phone || '',
            playerAge: parseInt(data.playerAge || data.age || '0'),
            playerGender: (data.playerGender || data.gender || 'PREFER_NOT_TO_SAY').toUpperCase(),
            playerCategory: data.playerCategory || data.category || ''
          })
        })
        .on('end', resolve)
        .on('error', reject)
    })

    // Process the registrations
    const mockReq = {
      json: async () => ({ registrations })
    } as any

    return await handleJSONData(mockReq, tournamentId, adminUser)

  } catch (error) {
    console.error('Error processing file upload:', error)
    return NextResponse.json(
      { error: 'Failed to process uploaded file' },
      { status: 500 }
    )
  }
}

function validateRegistrationData(data: any, rowNumber: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.playerName || data.playerName.trim() === '') {
    errors.push(`Row ${rowNumber}: Player name is required`)
  }

  if (!data.playerEmail || data.playerEmail.trim() === '') {
    errors.push(`Row ${rowNumber}: Player email is required`)
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.playerEmail.trim())) {
      errors.push(`Row ${rowNumber}: Invalid email format`)
    }
  }

  if (!data.playerPhone || data.playerPhone.trim() === '') {
    errors.push(`Row ${rowNumber}: Player phone is required`)
  }

  const age = parseInt(data.playerAge?.toString() || '0')
  if (!age || age < 5 || age > 100) {
    errors.push(`Row ${rowNumber}: Player age must be between 5 and 100`)
  }

  const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
  if (!data.playerGender || !validGenders.includes(data.playerGender.toUpperCase())) {
    errors.push(`Row ${rowNumber}: Invalid gender. Must be one of: ${validGenders.join(', ')}`)
  }

  if (!data.playerCategory || data.playerCategory.trim() === '') {
    errors.push(`Row ${rowNumber}: Player category is required`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === params.slug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get organizer ID
    const organizer = await prisma.organizer.findUnique({
      where: { slug: params.slug }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Get tournament registrations
    const registrations = await prisma.registration.findMany({
      where: {
        tournament: {
          id: params.id,
          organizerId: organizer.id
        }
      },
      select: {
        playerName: true,
        playerEmail: true,
        playerPhone: true,
        playerAge: true,
        playerGender: true,
        playerCategory: true,
        paymentStatus: true,
        registeredAt: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Convert to CSV format
    const csvHeader = 'playerName,playerEmail,playerPhone,playerAge,playerGender,playerCategory,paymentStatus,registeredAt\n'
    const csvData = registrations.map(reg => 
      `"${reg.playerName}","${reg.playerEmail}","${reg.playerPhone}",${reg.playerAge},"${reg.playerGender}","${reg.playerCategory}","${reg.paymentStatus}","${reg.registeredAt.toISOString()}"`
    ).join('\n')

    const csvContent = csvHeader + csvData

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tournament-${params.id}-registrations.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting registrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
