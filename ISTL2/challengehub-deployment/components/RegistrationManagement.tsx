'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, UserPlus, Edit, Trash2, AlertTriangle, AlertCircle } from 'lucide-react'

interface Registration {
  id: string
  playerName: string
  playerEmail: string
  playerPhone: string
  playerAge: number
  playerGender: string
  playerCategory: string
  paymentStatus: string
  registeredAt: string
}

interface RegistrationManagementProps {
  organizerSlug: string
  tournamentId: string
  tournamentTitle: string
  registrations: Registration[]
  maxParticipants: number
  currentParticipants: number
  tournamentStatus: string
  onRegistrationsUpdated: () => void
}

export default function RegistrationManagement({
  organizerSlug,
  tournamentId,
  tournamentTitle,
  registrations,
  maxParticipants,
  currentParticipants,
  tournamentStatus,
  onRegistrationsUpdated
}: RegistrationManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state for add/edit
  const [formData, setFormData] = useState({
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    playerAge: '',
    playerGender: 'MALE',
    playerCategory: 'MEN_SINGLES',
    paymentStatus: 'SUCCEEDED'
  })

  const resetForm = () => {
    setFormData({
      playerName: '',
      playerEmail: '',
      playerPhone: '',
      playerAge: '',
      playerGender: 'MALE',
      playerCategory: 'MEN_SINGLES',
      paymentStatus: 'SUCCEEDED'
    })
    setError('')
  }

  const handleAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleEdit = (registration: Registration) => {
    setSelectedRegistration(registration)
    setFormData({
      playerName: registration.playerName,
      playerEmail: registration.playerEmail,
      playerPhone: registration.playerPhone,
      playerAge: registration.playerAge.toString(),
      playerGender: registration.playerGender,
      playerCategory: registration.playerCategory,
      paymentStatus: registration.paymentStatus
    })
    setShowEditDialog(true)
  }

  const handleDelete = (registration: Registration) => {
    setSelectedRegistration(registration)
    setShowDeleteDialog(true)
  }

  const handleSubmit = async (action: 'add' | 'edit') => {
    if (!formData.playerName || !formData.playerEmail || !formData.playerPhone || !formData.playerAge) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = action === 'add' 
        ? `/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations`
        : `/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations/${selectedRegistration?.id}`

      const response = await fetch(url, {
        method: action === 'add' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: formData.playerName,
          playerEmail: formData.playerEmail,
          playerPhone: formData.playerPhone,
          playerAge: parseInt(formData.playerAge),
          playerGender: formData.playerGender,
          playerCategory: formData.playerCategory,
          paymentStatus: formData.paymentStatus
        }),
      })

      if (response.ok) {
        onRegistrationsUpdated()
        setShowAddDialog(false)
        setShowEditDialog(false)
        resetForm()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save registration')
      }
    } catch (error) {
      console.error('Error saving registration:', error)
      setError('Failed to save registration')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRegistration) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations/${selectedRegistration.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRegistrationsUpdated()
        setShowDeleteDialog(false)
        setSelectedRegistration(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete registration')
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
      setError('Failed to delete registration')
    } finally {
      setLoading(false)
    }
  }

  const getRegistrationProgress = () => {
    return (currentParticipants / maxParticipants) * 100
  }

  // Business logic: Check if tournament allows modifications
  const canModifyRegistrations = () => {
    return tournamentStatus === 'DRAFT' || tournamentStatus === 'ACTIVE'
  }

  const getStatusMessage = () => {
    if (tournamentStatus === 'COMPLETED') {
      return 'Tournament completed - registrations are read-only'
    }
    if (tournamentStatus === 'CANCELLED') {
      return 'Tournament cancelled - registrations are read-only'
    }
    return ''
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registrations ({currentParticipants}/{maxParticipants})
            </CardTitle>
            <CardDescription>
              Manage tournament participants and registrations
            </CardDescription>
          </div>
                     {currentParticipants < maxParticipants && canModifyRegistrations() && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Participant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Participant</DialogTitle>
                  <DialogDescription>
                    Add a new participant to {tournamentTitle}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerName">Full Name *</Label>
                      <Input
                        id="playerName"
                        value={formData.playerName}
                        onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerEmail">Email *</Label>
                      <Input
                        id="playerEmail"
                        type="email"
                        value={formData.playerEmail}
                        onChange={(e) => setFormData({ ...formData, playerEmail: e.target.value })}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerPhone">Phone *</Label>
                      <Input
                        id="playerPhone"
                        value={formData.playerPhone}
                        onChange={(e) => setFormData({ ...formData, playerPhone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerAge">Age *</Label>
                      <Input
                        id="playerAge"
                        type="number"
                        value={formData.playerAge}
                        onChange={(e) => setFormData({ ...formData, playerAge: e.target.value })}
                        placeholder="Enter age"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerGender">Gender</Label>
                      <Select value={formData.playerGender} onValueChange={(value) => setFormData({ ...formData, playerGender: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerCategory">Category</Label>
                      <Select value={formData.playerCategory} onValueChange={(value) => setFormData({ ...formData, playerCategory: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEN_SINGLES">Men's Singles</SelectItem>
                          <SelectItem value="WOMEN_SINGLES">Women's Singles</SelectItem>
                          <SelectItem value="MIXED_DOUBLES">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUCCEEDED">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSubmit('add')} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Participant'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
             <CardContent>
         {/* Status Message */}
         {getStatusMessage() && (
           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
             <div className="flex items-center gap-2 text-yellow-800">
               <AlertTriangle className="h-4 w-4" />
               <span className="text-sm font-medium">{getStatusMessage()}</span>
             </div>
           </div>
         )}

         {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Registration Progress</span>
            <span>{Math.round(getRegistrationProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getRegistrationProgress()}%` }}
            ></div>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No registrations yet</p>
            <p className="text-sm">Add participants using the "Add Participant" button above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div key={registration.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{registration.playerName}</h4>
                    <p className="text-sm text-gray-600">{registration.playerEmail}</p>
                    <p className="text-sm text-gray-500">
                      {registration.playerPhone} • {registration.playerCategory}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                                         <Badge variant="outline">
                       {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString() : 'N/A'}
                     </Badge>
                                         <div className="flex gap-1">
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => handleEdit(registration)}
                         disabled={!canModifyRegistrations()}
                         title={!canModifyRegistrations() ? 'Cannot edit completed tournament' : 'Edit participant'}
                       >
                         <Edit className="h-3 w-3" />
                       </Button>
                       <Button
                         size="sm"
                         variant="destructive"
                         onClick={() => handleDelete(registration)}
                         disabled={!canModifyRegistrations()}
                         title={!canModifyRegistrations() ? 'Cannot delete from completed tournament' : 'Delete participant'}
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
              <DialogDescription>
                Update participant details for {tournamentTitle}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-playerName">Full Name *</Label>
                  <Input
                    id="edit-playerName"
                    value={formData.playerName}
                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-playerEmail">Email *</Label>
                  <Input
                    id="edit-playerEmail"
                    type="email"
                    value={formData.playerEmail}
                    onChange={(e) => setFormData({ ...formData, playerEmail: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-playerPhone">Phone *</Label>
                  <Input
                    id="edit-playerPhone"
                    value={formData.playerPhone}
                    onChange={(e) => setFormData({ ...formData, playerPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-playerAge">Age *</Label>
                  <Input
                    id="edit-playerAge"
                    type="number"
                    value={formData.playerAge}
                    onChange={(e) => setFormData({ ...formData, playerAge: e.target.value })}
                    placeholder="Enter age"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-playerGender">Gender</Label>
                  <Select value={formData.playerGender} onValueChange={(value) => setFormData({ ...formData, playerGender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-playerCategory">Category</Label>
                  <Select value={formData.playerCategory} onValueChange={(value) => setFormData({ ...formData, playerCategory: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEN_SINGLES">Men's Singles</SelectItem>
                      <SelectItem value="WOMEN_SINGLES">Women's Singles</SelectItem>
                      <SelectItem value="MIXED_DOUBLES">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUCCEEDED">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit('edit')} disabled={loading}>
                {loading ? 'Updating...' : 'Update Participant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Participant
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedRegistration?.playerName}" from {tournamentTitle}?
                <br /><br />
                <strong>This action cannot be undone.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Participant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
