'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Plus, MapPin, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Venue {
  id: string
  name: string
  city: string
  state: string
  locality: string
  pincode: string
  address: string
  contactNumber: string
  email: string
}

export default function OrganizerVenues() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    locality: '',
    pincode: '',
    address: '',
    contactNumber: '',
    email: ''
  })

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
      } else {
        setError('Failed to load venues')
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
      setError('Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      state: '',
      locality: '',
      pincode: '',
      address: '',
      contactNumber: '',
      email: ''
    })
    setShowAddForm(false)
    setEditingVenue(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingVenue 
        ? `/api/organizer/${organizerSlug}/venues/${editingVenue.id}`
        : `/api/organizer/${organizerSlug}/venues`
      
      const method = editingVenue ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        resetForm()
        fetchVenues()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save venue')
      }
    } catch (error) {
      console.error('Error saving venue:', error)
      setError('An unexpected error occurred')
    }
  }

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue)
    setFormData({
      name: venue.name,
      city: venue.city,
      state: venue.state,
      locality: venue.locality,
      pincode: venue.pincode,
      address: venue.address,
      contactNumber: venue.contactNumber,
      email: venue.email
    })
    setShowAddForm(true)
  }

  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return

    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/venues/${venueId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchVenues()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete venue')
      }
    } catch (error) {
      console.error('Error deleting venue:', error)
      setError('An unexpected error occurred')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading venues...</p>
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
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/organizer/${organizerSlug}/dashboard`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Venues</h1>
              <p className="mt-2 text-gray-600">Add and manage venues for your tournaments</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </CardTitle>
              <CardDescription>
                {editingVenue ? 'Update venue information' : 'Enter venue details below'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Sports Complex"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locality">Locality</Label>
                    <Input
                      id="locality"
                      name="locality"
                      type="text"
                      value={formData.locality}
                      onChange={handleChange}
                      placeholder="e.g., Andheri West"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g., 400058"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="e.g., +91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Complete address of the venue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., venue@example.com"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingVenue ? 'Update Venue' : 'Add Venue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Venues List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Venues</CardTitle>
            <CardDescription>
              {venues.length} venue{venues.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No venues yet</p>
                <p className="text-sm">Add your first venue to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{venue.name}</h3>
                      <p className="text-sm text-gray-600">
                        {venue.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        {venue.city}, {venue.state} - {venue.pincode}
                      </p>
                      {venue.contactNumber && (
                        <p className="text-sm text-gray-500">
                          📞 {venue.contactNumber}
                        </p>
                      )}
                      {venue.email && (
                        <p className="text-sm text-gray-500">
                          ✉️ {venue.email}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(venue)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(venue.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
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
