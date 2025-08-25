'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Trophy, MapPin, Users, Calendar, Plus, Search, Filter, Edit, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Tournament {
  id: string
  title: string
  sport: string
  date: string
  status: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  venue?: {
    name: string
    city: string
  }
}

export default function OrganizerTournaments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])

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

    fetchTournaments()
  }, [session, status, router, organizerSlug])

  useEffect(() => {
    // Filter tournaments based on search and status
    let filtered = tournaments

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sport.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    setFilteredTournaments(filtered)
  }, [tournaments, searchTerm, statusFilter])

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments`)
      if (response.ok) {
        const data = await response.json()
        setTournaments(data.tournaments || [])
      } else {
        throw new Error('Failed to fetch tournaments')
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      setError('Failed to load tournaments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading tournaments...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
              <p className="mt-2 text-gray-600">Manage all your tournaments</p>
            </div>
            <Link href={`/organizer/${organizerSlug}/tournaments/new`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Tournament
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournaments List */}
        <div className="space-y-4">
          {filteredTournaments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter ? 'No tournaments found' : 'No tournaments yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first tournament to get started'
                  }
                </p>
                {!searchTerm && !statusFilter && (
                  <Link href={`/organizer/${organizerSlug}/tournaments/new`}>
                    <Button>Create Tournament</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{tournament.title}</h3>
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          <span>{tournament.sport}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(tournament.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(tournament.entryFee)}</span>
                        </div>
                      </div>

                      {tournament.venue && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{tournament.venue.name}, {tournament.venue.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/organizer/${organizerSlug}/tournaments/${tournament.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/organizer/${organizerSlug}/tournaments/${tournament.id}/edit`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTournaments.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {filteredTournaments.length} of {tournaments.length} tournaments</span>
                <div className="flex items-center gap-4">
                  <span>Active: {tournaments.filter(t => t.status === 'ACTIVE').length}</span>
                  <span>Draft: {tournaments.filter(t => t.status === 'DRAFT').length}</span>
                  <span>Completed: {tournaments.filter(t => t.status === 'COMPLETED').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
