'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, XCircle, Building2, Users, Calendar } from 'lucide-react'

interface OrganizerApplication {
  id: string
  orgName: string
  user: {
    name: string
    email: string
  }
  submittedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  docsURL?: string
}

interface Organizer {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
  owner: {
    name: string
    email: string
  }
  _count: {
    tournaments: number
    venues: number
    members: number
  }
}

export default function SuperAdminOrganizers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<OrganizerApplication[]>([])
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [applicationsRes, organizersRes] = await Promise.all([
        fetch('/api/super-admin/applications'),
        fetch('/api/super-admin/organizers')
      ])

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications || [])
      }

      if (organizersRes.ok) {
        const organizersData = await organizersRes.json()
        setOrganizers(organizersData.organizers || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load organizer data')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const response = await fetch(`/api/super-admin/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        setError(`Failed to ${action.toLowerCase()} application`)
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing application:`, error)
      setError(`Failed to ${action.toLowerCase()} application`)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading organizers...</p>
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
                <a href="/super-admin/organizers" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Organizers
                </a>
                <a href="/super-admin/analytics" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
                  <span className="text-gray-500">Organizers</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organizer Management</h1>
            <p className="mt-2 text-gray-600">Manage organizer applications and monitor approved organizers</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{organizers.filter(o => o.status === 'APPROVED').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Organizers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{organizers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>
                Review and approve/reject organizer applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No pending applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{application.orgName}</h3>
                        <p className="text-sm text-gray-600">
                          Contact: {application.user.name} ({application.user.email})
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                        {application.docsURL && (
                          <a href={application.docsURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            View Documents
                          </a>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApplicationAction(application.id, 'APPROVE')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleApplicationAction(application.id, 'REJECT')}
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Organizers */}
          <Card>
            <CardHeader>
              <CardTitle>Active Organizers</CardTitle>
              <CardDescription>
                Monitor approved organizers and their activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{organizer.name}</h3>
                      <p className="text-sm text-gray-600">
                        Owner: {organizer.owner.name} ({organizer.owner.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(organizer.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-4 mt-2">
                        <span className="text-sm text-blue-600">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {organizer._count.tournaments} Tournaments
                        </span>
                        <span className="text-sm text-green-600">
                          <Building2 className="h-4 w-4 inline mr-1" />
                          {organizer._count.venues} Venues
                        </span>
                        <span className="text-sm text-purple-600">
                          <Users className="h-4 w-4 inline mr-1" />
                          {organizer._count.members} Members
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        organizer.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {organizer.status}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/organizer/${organizer.slug}/dashboard`, '_blank')}
                      >
                        View Dashboard
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
