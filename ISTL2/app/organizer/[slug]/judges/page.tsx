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
import { AlertCircle, Plus, Users, Edit, Trash2, ArrowLeft, Award } from 'lucide-react'
import Link from 'next/link'
import { OrganizerNav } from '@/components/OrganizerNav'

interface Judge {
  id: string
  fullName: string
  email: string
  phone: string
  categories: string[]
  gender: string
  bio: string
  createdAt: string
}

export default function OrganizerJudges() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    gender: '',
    bio: ''
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

    fetchJudges()
  }, [session, status, router, organizerSlug])

  const fetchJudges = async () => {
    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/judges`)
      if (response.ok) {
        const data = await response.json()
        setJudges(data.judges || [])
      } else {
        setError('Failed to load judges')
      }
    } catch (error) {
      console.error('Error fetching judges:', error)
      setError('Failed to load judges')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: '',
      gender: '',
      bio: ''
    })
    setShowAddForm(false)
    setEditingJudge(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingJudge 
        ? `/api/organizer/${organizerSlug}/judges/${editingJudge.id}`
        : `/api/organizer/${organizerSlug}/judges`
      
      const method = editingJudge ? 'PUT' : 'POST'
      
      // Convert specialties string to array
      const specialtiesArray = formData.specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          specialties: specialtiesArray
        }),
      })

      if (response.ok) {
        resetForm()
        fetchJudges()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save judge')
      }
    } catch (error) {
      console.error('Error saving judge:', error)
      setError('An unexpected error occurred')
    }
  }

  const handleEdit = (judge: Judge) => {
    setEditingJudge(judge)
    setFormData({
      name: judge.fullName,
      email: judge.email,
      phone: judge.phone || '',
      specialties: judge.categories.join(', '),
      gender: judge.gender,
      bio: judge.bio || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (judgeId: string) => {
    if (!confirm('Are you sure you want to delete this judge?')) return

    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/judges/${judgeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchJudges()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete judge')
      }
    } catch (error) {
      console.error('Error deleting judge:', error)
      setError('An unexpected error occurred')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading judges...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizerNav currentPage="judges" />
      
      <div className="py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Manage Judges</h1>
                <p className="mt-2 text-gray-600">Add and manage judges for your tournaments</p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Judge
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
                  {editingJudge ? 'Edit Judge' : 'Add New Judge'}
                </CardTitle>
                <CardDescription>
                  {editingJudge ? 'Update judge information' : 'Enter judge details below'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Judge Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g., +91 98765 43210"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties *</Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      type="text"
                      required
                      value={formData.specialties}
                      onChange={handleChange}
                      placeholder="e.g., Badminton, Tennis, Cricket (comma-separated)"
                    />
                    <p className="text-sm text-gray-500">
                      Enter multiple specialties separated by commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Brief description of the judge's background, qualifications, etc."
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
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {editingJudge ? 'Update Judge' : 'Add Judge'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Judges List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Judges</CardTitle>
              <CardDescription>
                {judges.length} judge{judges.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {judges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No judges yet</p>
                  <p className="text-sm">Add your first judge to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {judges.map((judge) => (
                    <div
                      key={judge.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-lg">{judge.fullName}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ✉️ {judge.email} • 📞 {judge.phone}
                        </p>
                        <p className="text-sm text-gray-500">
                          🏆 {judge.categories.length} specialties
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {judge.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        {judge.bio && (
                          <p className="text-sm text-gray-600 mt-2">
                            {judge.bio}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(judge)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(judge.id)}
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
    </div>
  )
}
