'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Trophy, MapPin, Users, Calendar, Edit, ArrowLeft, Settings, UserPlus, FileText, Trash2, AlertTriangle, Info } from 'lucide-react'
import Link from 'next/link'
import JudgeAssignment from '@/components/JudgeAssignment'
import TournamentProgression from '@/components/TournamentProgression'
import BulkRegistration from '@/components/BulkRegistration'
import RegistrationManagement from '@/components/RegistrationManagement'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Tournament {
  id: string
  title: string
  sport: string
  date: string
  status: string
  maxParticipants: number
  currentParticipants: number
  entryFee: number
  description?: string
  venue?: {
    id: string
    name: string
    city: string
    state: string
    locality: string
  }
  registrations: {
    id: string
    playerName: string
    playerEmail: string
    playerPhone: string
    playerAge: number
    playerGender: string
    playerCategory: string
    paymentStatus: string
    registeredAt: string
  }[]
}

export default function TournamentDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

    fetchTournament()
  }, [session, status, router, organizerSlug, tournamentId])

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}`)
      if (response.ok) {
        const data = await response.json()
        setTournament(data.tournament)
      } else {
        throw new Error('Failed to fetch tournament')
      }
    } catch (error) {
      console.error('Error fetching tournament:', error)
      setError('Failed to load tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!tournament) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Redirect to tournaments list
        router.push(`/organizer/${organizerSlug}/tournaments`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete tournament')
      }
    } catch (error) {
      console.error('Error deleting tournament:', error)
      alert('Failed to delete tournament')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
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
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getRegistrationProgress = () => {
    if (!tournament) return 0
    return (tournament.currentParticipants / tournament.maxParticipants) * 100
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading tournament...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Tournament not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/organizer/${organizerSlug}/tournaments`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tournaments
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tournament.title}</h1>
              <p className="mt-2 text-gray-600">Tournament Details & Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(tournament.status)}>
              {tournament.status}
            </Badge>
            <span className="text-sm text-gray-600">
              Created on {formatDate(tournament.date)}
            </span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Tournament Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sport</label>
                    <p className="text-lg font-medium">{tournament.sport}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Entry Fee</label>
                    <p className="text-lg font-medium">{formatCurrency(tournament.entryFee)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-lg font-medium">{formatDate(tournament.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status}
                    </Badge>
                  </div>
                </div>
                
                {tournament.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700 mt-1">{tournament.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Venue Information */}
            {tournament.venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">{tournament.venue.name}</h3>
                    <p className="text-gray-600">
                      {tournament.venue.locality}, {tournament.venue.city}, {tournament.venue.state}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Management */}
            <RegistrationManagement
              organizerSlug={organizerSlug}
              tournamentId={tournamentId}
              tournamentTitle={tournament.title}
              registrations={tournament.registrations}
              maxParticipants={tournament.maxParticipants}
              currentParticipants={tournament.currentParticipants}
              tournamentStatus={tournament.status}
              onRegistrationsUpdated={fetchTournament}
            />

            {/* Bulk Registration Management */}
            <BulkRegistration 
              organizerSlug={organizerSlug}
              tournamentId={tournamentId}
              tournamentTitle={tournament.title}
              onRegistrationsUpdated={fetchTournament}
            />

            {/* Judge Assignment */}
            <JudgeAssignment 
              organizerSlug={organizerSlug}
              tournamentId={tournamentId}
              tournamentTitle={tournament.title}
            />

            {/* Tournament Progression */}
            <TournamentProgression 
              organizerSlug={organizerSlug}
              tournamentId={tournamentId}
              tournamentTitle={tournament.title}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/organizer/${organizerSlug}/tournaments/${tournamentId}/edit`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Tournament
                  </Button>
                </Link>
                
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                
                {tournament.status === 'DRAFT' && (
                  <Button className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    Activate Tournament
                  </Button>
                )}
                
                {tournament.status === 'ACTIVE' && (
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Matches
                  </Button>
                )}

                {/* Delete Tournament Button */}
                {tournament.status === 'DRAFT' && tournament.currentParticipants === 0 && (
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Tournament
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Delete Tournament
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{tournament.title}"? 
                          <br /><br />
                          <strong>This action cannot be undone.</strong>
                          <br />
                          Only draft tournaments with no registrations can be deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Delete Tournament'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Show why tournament can't be deleted */}
                {tournament.status !== 'DRAFT' && (
                  <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                    <Info className="h-4 w-4 inline mr-1" />
                    Cannot delete {tournament.status.toLowerCase()} tournaments
                  </div>
                )}

                {tournament.currentParticipants > 0 && (
                  <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                    <Users className="h-4 w-4 inline mr-1" />
                    Cannot delete tournaments with registrations
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Capacity</span>
                  <span className="font-medium">{tournament.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Registrations</span>
                  <span className="font-medium text-blue-600">{tournament.currentParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Slots</span>
                  <span className="font-medium text-green-600">
                    {tournament.maxParticipants - tournament.currentParticipants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Rate</span>
                  <span className="font-medium">
                    {Math.round(getRegistrationProgress())}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}