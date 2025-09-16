'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, Calendar, MapPin, Users, Trophy, DollarSign } from 'lucide-react'

interface GlobalStats {
  totalTournaments: number
  activeTournaments: number
  completedTournaments: number
  totalVenues: number
  totalRegistrations: number
  totalRevenue: number
  totalOrganizers: number
  approvedOrganizers: number
}

interface TournamentOverview {
  id: string
  title: string
  sport: string
  status: string
  date: string
  organizer: {
    name: string
    slug: string
  }
  venue?: {
    name: string
    city: string
  }
  _count: {
    registrations: number
  }
}

export default function SuperAdminAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<GlobalStats>({
    totalTournaments: 0,
    activeTournaments: 0,
    completedTournaments: 0,
    totalVenues: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    totalOrganizers: 0,
    approvedOrganizers: 0
  })
  const [recentTournaments, setRecentTournaments] = useState<TournamentOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchAnalytics()
  }, [session, status, router])

  const fetchAnalytics = async () => {
    try {
      const [statsRes, tournamentsRes] = await Promise.all([
        fetch('/api/super-admin/analytics/stats'),
        fetch('/api/super-admin/analytics/tournaments')
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
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Super Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/super-admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/super-admin/organizers" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Organizers
                </a>
                <a href="/super-admin/analytics" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Analytics
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">Welcome, {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/super-admin" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500">Analytics</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="mt-2 text-gray-600">Global insights and metrics across all organizers</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Global Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTournaments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeTournaments} active, {stats.completedTournaments} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalVenues}</div>
                <p className="text-xs text-muted-foreground">
                  Across {stats.approvedOrganizers} organizers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalRegistrations}</div>
                <p className="text-xs text-muted-foreground">
                  Platform-wide participant count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Entry fees collected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Tournaments Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Tournament Activity
              </CardTitle>
              <CardDescription>
                Latest tournaments across all organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTournaments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No recent tournaments</p>
                  </div>
                ) : (
                  recentTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{tournament.title}</h3>
                          <p className="text-sm text-gray-600">
                            Sport: {tournament.sport} • Organizer: {tournament.organizer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Date: {new Date(tournament.date).toLocaleDateString()}
                            {tournament.venue && ` • Venue: ${tournament.venue.name}, ${tournament.venue.city}`}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-blue-600">
                              <Users className="h-4 w-4 inline mr-1" />
                              {tournament._count.registrations} participants
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tournament.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : tournament.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tournament.status}
                          </span>
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                            onClick={() => window.open(`/organizer/${tournament.organizer.slug}/tournaments/${tournament.id}`, '_blank')}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Organizer Performance</CardTitle>
                <CardDescription>
                  Top performing organizers by activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">Performance metrics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Platform revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">Revenue analytics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
