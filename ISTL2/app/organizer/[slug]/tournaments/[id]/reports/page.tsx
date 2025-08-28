'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileText, Users, Trophy, Calendar, DollarSign, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Tournament {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
  venue: any
  registrations: any[]
  maxParticipants: number
  entryFee: number
}

interface ReportsPageProps {
  params: {
    slug: string
    id: string
  }
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    fetchTournament()
  }, [])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/organizer/${params.slug}/tournaments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTournament(data.tournament)
      }
    } catch (error) {
      console.error('Error fetching tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (reportType: string) => {
    setDownloading(reportType)
    try {
      let url = ''
      let filename = ''
      
      switch (reportType) {
        case 'registrations':
          url = `/api/organizer/${params.slug}/tournaments/${params.id}/registrations/bulk`
          filename = `${tournament?.title}-registrations.csv`
          break
        case 'summary':
          // For now, we'll generate a simple summary report
          generateSummaryReport()
          return
        default:
          alert('Report type not implemented yet')
          return
      }

      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      } else {
        alert('Failed to download report')
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    } finally {
      setDownloading(null)
    }
  }

  const generateSummaryReport = () => {
    if (!tournament) return

    const registrationsByCategory = tournament.registrations.reduce((acc: any, reg: any) => {
      acc[reg.playerCategory] = (acc[reg.playerCategory] || 0) + 1
      return acc
    }, {})

    const registrationsByGender = tournament.registrations.reduce((acc: any, reg: any) => {
      acc[reg.playerGender] = (acc[reg.playerGender] || 0) + 1
      return acc
    }, {})

    const paidRegistrations = tournament.registrations.filter(reg => reg.paymentStatus === 'SUCCEEDED').length
    const totalRevenue = paidRegistrations * (tournament.entryFee || 0)

    const summaryData = {
      tournament: {
        title: tournament.title,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        venue: tournament.venue?.name || 'N/A',
        status: tournament.status
      },
      statistics: {
        totalRegistrations: tournament.registrations.length,
        maxParticipants: tournament.maxParticipants,
        availableSlots: tournament.maxParticipants - tournament.registrations.length,
        registrationRate: `${Math.round((tournament.registrations.length / tournament.maxParticipants) * 100)}%`,
        paidRegistrations,
        pendingPayments: tournament.registrations.length - paidRegistrations,
        totalRevenue: `₹${totalRevenue.toLocaleString()}`
      },
      breakdown: {
        byCategory: registrationsByCategory,
        byGender: registrationsByGender
      }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(summaryData, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${tournament.title}-summary-report.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournament Not Found</h1>
          <Link href={`/organizer/${params.slug}/tournaments`}>
            <Button>Back to Tournaments</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const registrationsByCategory = tournament.registrations.reduce((acc: any, reg: any) => {
    acc[reg.playerCategory] = (acc[reg.playerCategory] || 0) + 1
    return acc
  }, {})

  const paidRegistrations = tournament.registrations.filter(reg => reg.paymentStatus === 'SUCCEEDED').length
  const totalRevenue = paidRegistrations * (tournament.entryFee || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/organizer/${params.slug}/tournaments/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournament
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Reports</h1>
          <p className="text-gray-600 mt-2">{tournament.title}</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{tournament.registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registration Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((tournament.registrations.length / tournament.maxParticipants) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={tournament.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {tournament.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Registration by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(registrationsByCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Paid</span>
                  <Badge variant="default">{paidRegistrations}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending</span>
                  <Badge variant="secondary">{tournament.registrations.length - paidRegistrations}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => handleDownload('registrations')}
                disabled={downloading === 'registrations'}
              >
                <div className="flex items-center w-full">
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Registrations CSV</div>
                    <div className="text-sm text-gray-500">All participant data</div>
                  </div>
                  {downloading === 'registrations' && (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  )}
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => handleDownload('summary')}
                disabled={downloading === 'summary'}
              >
                <div className="flex items-center w-full">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Summary Report</div>
                    <div className="text-sm text-gray-500">Statistics & analytics</div>
                  </div>
                  {downloading === 'summary' && (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  )}
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                disabled
              >
                <div className="flex items-center w-full">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Match Schedule</div>
                    <div className="text-sm text-gray-500">Coming soon</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
