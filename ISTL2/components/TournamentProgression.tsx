'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Play, Clock, CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react'

interface Match {
  id: string
  matchCode: string
  player1: string | null
  player2: string | null
  winner: string | null
  score: string | null
  isCompleted: boolean
  scheduledAt: string | null
  completedAt: string | null
  judgeId: string | null
  courtNumber: number | null
  judge?: {
    id: string
    fullName: string
  }
}

interface TournamentRound {
  id: string
  name: string
  order: number
  maxMatches: number
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null
  matches: Match[]
}

interface TournamentProgressionData {
  id: string
  title: string
  status: string
  currentRound: string | null
  rounds: TournamentRound[]
  totalParticipants: number
  maxParticipants: number
}

interface TournamentProgressionProps {
  organizerSlug: string
  tournamentId: string
  tournamentTitle: string
}

export default function TournamentProgression({ 
  organizerSlug, 
  tournamentId, 
  tournamentTitle 
}: TournamentProgressionProps) {
  const [tournament, setTournament] = useState<TournamentProgressionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchResult, setMatchResult] = useState({ winner: '', score: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTournamentProgression()
  }, [])

  const fetchTournamentProgression = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`)
      
      if (response.ok) {
        const data = await response.json()
        setTournament(data.tournament)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch tournament progression')
      }
    } catch (error) {
      console.error('Error fetching tournament progression:', error)
      setError('Failed to fetch tournament progression')
    } finally {
      setLoading(false)
    }
  }

  const initializeTournament = async () => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'initialize'
        })
      })

      if (response.ok) {
        await fetchTournamentProgression()
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to initialize tournament')
      }
    } catch (error) {
      console.error('Error initializing tournament:', error)
      setError('Failed to initialize tournament')
    } finally {
      setUpdating(false)
    }
  }

  const updateMatchResult = async () => {
    if (!selectedMatch || !matchResult.winner || !matchResult.score) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_match',
          data: {
            matchId: selectedMatch.id,
            winner: matchResult.winner,
            score: matchResult.score
          }
        })
      })

      if (response.ok) {
        await fetchTournamentProgression()
        setSelectedMatch(null)
        setMatchResult({ winner: '', score: '' })
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update match result')
      }
    } catch (error) {
      console.error('Error updating match result:', error)
      setError('Failed to update match result')
    } finally {
      setUpdating(false)
    }
  }

  const advanceRound = async (roundName: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'advance_round',
          data: {
            currentRound: roundName
          }
        })
      })

      if (response.ok) {
        await fetchTournamentProgression()
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to advance round')
      }
    } catch (error) {
      console.error('Error advancing round:', error)
      setError('Failed to advance round')
    } finally {
      setUpdating(false)
    }
  }

  const openMatchDialog = (match: Match) => {
    setSelectedMatch(match)
    setMatchResult({
      winner: match.winner || '',
      score: match.score || ''
    })
  }

  const getMatchStatusBadge = (match: Match) => {
    if (match.isCompleted) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (match.player1 && match.player2) {
      return <Badge variant="secondary">Ready</Badge>
    }
    return <Badge variant="outline">Waiting</Badge>
  }

  const getRoundStatusBadge = (round: TournamentRound) => {
    if (round.isCompleted) {
      return <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    }
    if (tournament?.currentRound === round.name) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        In Progress
      </Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading tournament progression...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Progression - {tournamentTitle}
          </CardTitle>
          <CardDescription>
            Manage tournament rounds, matches, and progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!tournament?.rounds || tournament.rounds.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tournament Not Initialized</h3>
              <p className="text-gray-600 mb-4">
                Initialize the tournament progression to create rounds and matches based on registered participants.
              </p>
              <Button onClick={initializeTournament} disabled={updating}>
                {updating ? 'Initializing...' : 'Initialize Tournament'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tournament Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tournament Status</h3>
                    <p className="text-sm text-gray-600">
                      Current Round: {tournament.currentRound || 'Not Started'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {tournament.totalParticipants} / {tournament.maxParticipants} Participants
                      </span>
                    </div>
                    <Badge variant={tournament.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {tournament.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rounds */}
              {tournament.rounds.map((round) => (
                <Card key={round.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{round.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getRoundStatusBadge(round)}
                        {tournament.currentRound === round.name && 
                         round.matches.every(m => m.isCompleted) && 
                         !round.isCompleted && (
                          <Button 
                            size="sm" 
                            onClick={() => advanceRound(round.name)}
                            disabled={updating}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Advance Round
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {round.matches.length} matches 
                      {round.isCompleted && round.completedAt && (
                        <span className="ml-2">
                          • Completed {new Date(round.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {round.matches.map((match) => (
                        <Card 
                          key={match.id} 
                          className={`cursor-pointer transition-colors ${
                            !match.isCompleted && match.player1 && match.player2 
                              ? 'hover:bg-gray-50' 
                              : ''
                          }`}
                          onClick={() => !match.isCompleted && match.player1 && match.player2 && openMatchDialog(match)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm text-gray-600">
                                {match.matchCode}
                              </span>
                              {getMatchStatusBadge(match)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${match.winner === match.player1 ? 'font-semibold' : ''}`}>
                                  {match.player1 || 'TBD'}
                                </span>
                                {match.winner === match.player1 && (
                                  <Trophy className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              
                              <div className="text-center text-xs text-gray-500">vs</div>
                              
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${match.winner === match.player2 ? 'font-semibold' : ''}`}>
                                  {match.player2 || 'TBD'}
                                </span>
                                {match.winner === match.player2 && (
                                  <Trophy className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              
                              {match.score && (
                                <div className="text-center text-xs text-gray-600 mt-2 font-mono">
                                  {match.score}
                                </div>
                              )}
                              
                              {match.judge && (
                                <div className="text-xs text-gray-500 text-center">
                                  Judge: {match.judge.fullName}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Result Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Match Result</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-center">{selectedMatch.matchCode}</div>
                <div className="text-sm text-center text-gray-600 mt-1">
                  {selectedMatch.player1} vs {selectedMatch.player2}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="winner">Winner</Label>
                <Select value={matchResult.winner} onValueChange={(value) => setMatchResult(prev => ({ ...prev, winner: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMatch.player1 && (
                      <SelectItem value={selectedMatch.player1}>{selectedMatch.player1}</SelectItem>
                    )}
                    {selectedMatch.player2 && (
                      <SelectItem value={selectedMatch.player2}>{selectedMatch.player2}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  value={matchResult.score}
                  onChange={(e) => setMatchResult(prev => ({ ...prev, score: e.target.value }))}
                  placeholder="e.g., 21-15, 21-18"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={updateMatchResult} 
                  disabled={!matchResult.winner || !matchResult.score || updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Update Result'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1"
                >
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