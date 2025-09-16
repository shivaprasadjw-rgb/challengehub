'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Users, UserPlus, Edit, Trash2, Shield, Crown, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  userRole: string
  organizerRole: string
  status: string
  joinedAt: string
  lastActive?: string
}

export default function OrganizerMembers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const organizerSlug = params.slug as string
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [newMember, setNewMember] = useState({ email: '', role: 'MEMBER' })
  const [updating, setUpdating] = useState(false)

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

    fetchMembers()
  }, [session, status, router, organizerSlug])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/members`)
      
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch members')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }

  const addMember = async () => {
    if (!newMember.email.trim()) {
      setError('Email is required')
      return
    }

    try {
      setUpdating(true)
      setError('')

      const response = await fetch(`/api/organizer/${organizerSlug}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        await fetchMembers()
        setIsAddDialogOpen(false)
        setNewMember({ email: '', role: 'MEMBER' })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      setError('Failed to add member')
    } finally {
      setUpdating(false)
    }
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      setUpdating(true)
      setError('')

      const response = await fetch(`/api/organizer/${organizerSlug}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await fetchMembers()
        setIsEditDialogOpen(false)
        setSelectedMember(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update member role')
      }
    } catch (error) {
      console.error('Error updating member role:', error)
      setError('Failed to update member role')
    } finally {
      setUpdating(false)
    }
  }

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      return
    }

    try {
      setUpdating(true)
      setError('')

      const response = await fetch(`/api/organizer/${organizerSlug}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMembers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      setError('Failed to remove member')
    } finally {
      setUpdating(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'STAFF':
        return <User className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-yellow-100 text-yellow-800'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/organizer/${organizerSlug}/dashboard`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-2">Manage organizer staff and member roles</p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
              <CardDescription>
                {members.length} team member{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="member@example.com"
                    />
                    <p className="text-sm text-gray-500">
                      User must already have an account on the platform
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={addMember} disabled={updating} className="flex-1">
                      {updating ? 'Adding...' : 'Add Member'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No team members</p>
              <p className="text-sm">Add your first team member to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.organizerRole)}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(member.organizerRole)}>
                            {member.organizerRole}
                          </Badge>
                          <Badge className={getStatusBadgeColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-500">
                        <p>Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                        <p>User Role: {member.userRole}</p>
                      </div>
                      
                      {member.organizerRole !== 'OWNER' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMember(member)
                              setIsEditDialogOpen(true)
                            }}
                            disabled={updating}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(member.id, member.name)}
                            disabled={updating}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Member Role</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedMember.name}</p>
                <p className="text-sm text-gray-600">{selectedMember.email}</p>
                <p className="text-sm text-gray-500">Current Role: {selectedMember.organizerRole}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select 
                  defaultValue={selectedMember.organizerRole} 
                  onValueChange={(value) => setSelectedMember(prev => prev ? { ...prev, organizerRole: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => updateMemberRole(selectedMember.id, selectedMember.organizerRole)} 
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Update Role'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
