'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Venue {
  id: string
  name: string
  city: string
  state: string
}

export default function CreateTournament() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    date: '',
    time: '',
    entryFee: '',
    maxParticipants: '32',
    venueId: '',
    description: ''
  })
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    fetchVenues()
  }, [session, status, router, organizerSlug])

  const fetchVenues = async () => {
    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/venues`)
      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          sport: formData.sport,
          date: dateTime.toISOString(),
          entryFee: parseFloat(formData.entryFee),
          maxParticipants: parseInt(formData.maxParticipants),
          venueId: formData.venueId || null
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/organizer/${organizerSlug}/dashboard`)
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create tournament')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Save className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Tournament Created!</CardTitle>
              <CardDescription>
                Your tournament has been created successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/organizer/${organizerSlug}/dashboard`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Tournament</h1>
          <p className="mt-2 text-gray-600">Set up a new tournament for your organization</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tournament Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Annual Badminton Championship"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">Sport *</Label>
                  <Input
                    id="sport"
                    name="sport"
                    type="text"
                    required
                    value={formData.sport}
                    onChange={handleChange}
                    placeholder="e.g., Badminton, Tennis, Cricket"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee (₹) *</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.entryFee}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    required
                    min="2"
                    max="1000"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    placeholder="32"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueId">Venue (Optional)</Label>
                <select
                  id="venueId"
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}, {venue.state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your tournament, rules, prizes, etc."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link href={`/organizer/${organizerSlug}/dashboard`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Tournament
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
