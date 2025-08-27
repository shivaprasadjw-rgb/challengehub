'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Plus, X, Users, Award } from 'lucide-react'

interface Judge {
  id: string
  fullName: string
  email: string
  categories: string[]
  gender: string
}

interface JudgeAssignment {
  id: string
  role: string
  assignedAt: string
  judge: Judge
}

interface JudgeAssignmentProps {
  organizerSlug: string
  tournamentId: string
  tournamentTitle: string
}

export default function JudgeAssignment({ organizerSlug, tournamentId, tournamentTitle }: JudgeAssignmentProps) {
  const [judges, setJudges] = useState<Judge[]>([])
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedJudge, setSelectedJudge] = useState('')
  const [selectedRole, setSelectedRole] = useState('JUDGE')

  useEffect(() => {
    fetchData()
  }, [organizerSlug, tournamentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [judgesResponse, assignmentsResponse] = await Promise.all([
        fetch(`/api/organizer/${organizerSlug}/judges`),
        fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/judges`)
      ])

      if (judgesResponse.ok) {
        const judgesData = await judgesResponse.json()
        setJudges(judgesData.judges || [])
      }

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json()
        setAssignments(assignmentsData.assignments || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignJudge = async () => {
    if (!selectedJudge) {
      setError('Please select a judge')
      return
    }

    try {
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/judges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judgeId: selectedJudge,
          role: selectedRole
        }),
      })

      if (response.ok) {
        setSelectedJudge('')
        setSelectedRole('JUDGE')
        fetchData()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to assign judge')
      }
    } catch (error) {
      console.error('Error assigning judge:', error)
      setError('An unexpected error occurred')
    }
  }

  const handleRemoveJudge = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this judge?')) return

    try {
      const response = await fetch(
        `/api/organizer/${organizerSlug}/tournaments/${tournamentId}/judges?assignmentId=${assignmentId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        fetchData()
        setError('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to remove judge')
      }
    } catch (error) {
      console.error('Error removing judge:', error)
      setError('An unexpected error occurred')
    }
  }

  const getAvailableJudges = () => {
    const assignedJudgeIds = assignments.map(a => a.judge.id)
    return judges.filter(judge => !assignedJudgeIds.includes(judge.id))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HEAD_JUDGE': return 'bg-red-100 text-red-800'
      case 'LINE_JUDGE': return 'bg-blue-100 text-blue-800'
      case 'ASSISTANT_JUDGE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Judge Assignment</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Judge Assignment
        </CardTitle>
        <CardDescription>
          Manage judges for tournament: {tournamentTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Assign New Judge */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Assign New Judge</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedJudge} onValueChange={setSelectedJudge}>
              <SelectTrigger>
                <SelectValue placeholder="Select judge" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableJudges().map((judge) => (
                  <SelectItem key={judge.id} value={judge.id}>
                    {judge.fullName} ({judge.categories.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HEAD_JUDGE">Head Judge</SelectItem>
                <SelectItem value="LINE_JUDGE">Line Judge</SelectItem>
                <SelectItem value="ASSISTANT_JUDGE">Assistant Judge</SelectItem>
                <SelectItem value="JUDGE">General Judge</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAssignJudge}
              disabled={!selectedJudge}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Judge
            </Button>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Assignments</h3>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No judges assigned yet</p>
              <p className="text-sm">Assign judges to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                                 <div
                   key={assignment.id}
                   className="flex items-center justify-between p-3 border rounded-lg"
                 >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{assignment.judge.fullName}</p>
                      <p className="text-sm text-gray-600">{assignment.judge.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(assignment.role)}>
                          {assignment.role.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveJudge(assignment.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
