'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Trophy, MapPin, Users, Calendar, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

interface OrganizerStats {
  totalTournaments: number
  activeTournaments: number
  totalVenues: number
  totalJudges: number
  totalRegistrations: number
}

interface Tournament {
  id: string
  title: string
  sport: string
  date: string
  status: string
  maxParticipants: number
  currentParticipants: number
}

export default function OrganizerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [stats, setStats] = useState<OrganizerStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    totalVenues: 0,
    totalJudges: 0,
    totalRegistrations: 0
  })
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Check if user has access to this organizer
    const hasAccess = session.user.organizerIds?.some(org => org.slug === organizerSlug)
    if (!hasAccess && session.user.role !== 'SUPER_ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchDashboardData()
  }, [session, status, router, organizerSlug])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tournamentsRes] = await Promise.all([
        fetch(`/api/organizer/${organizerSlug}/stats`),
        fetch(`/api/organizer/${organizerSlug}/tournaments?limit=5`)
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || stats)
      }

      if (tournamentsRes.ok) {
        const tournamentsData = await tournamentsRes.json()
        setRecentTournaments(tournamentsData.tournaments || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your tournaments, venues, and judges</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVenues}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Judges</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJudges}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href={`/organizer/${organizerSlug}/tournaments/new`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Plus className="mx-auto h-8 w-8 text-blue-600" />
                <CardTitle className="text-lg">Create Tournament</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Start a new tournament
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizer/${organizerSlug}/venues`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-green-600" />
                <CardTitle className="text-lg">Manage Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Add or edit venues
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizer/${organizerSlug}/judges`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="mx-auto h-8 w-8 text-purple-600" />
                <CardTitle className="text-lg">Manage Judges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Add or edit judges
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizer/${organizerSlug}/members`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="mx-auto h-8 w-8 text-blue-600" />
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Manage staff and roles
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizer/${organizerSlug}/settings`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Settings className="mx-auto h-8 w-8 text-gray-600" />
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  Organizer settings
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Tournaments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tournaments</CardTitle>
                <CardDescription>
                  Your latest tournament activities
                </CardDescription>
              </div>
              <Link href={`/organizer/${organizerSlug}/tournaments`}>
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTournaments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No tournaments yet</p>
                <p className="text-sm">Create your first tournament to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{tournament.title}</h3>
                      <p className="text-sm text-gray-600">
                        {tournament.sport} • {new Date(tournament.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tournament.currentParticipants}/{tournament.maxParticipants} participants
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        tournament.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tournament.status}
                      </span>
                      <Link href={`/organizer/${organizerSlug}/tournaments/${tournament.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
