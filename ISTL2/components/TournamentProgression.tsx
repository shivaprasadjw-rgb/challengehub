"use client";

import { useState, useEffect } from "react";

interface TournamentProgressionProps {
  tournamentId: string;
  onClose: () => void;
}

interface Match {
  id: string;
  round: string;
  players: string[];
  winner?: string;
  isCompleted: boolean;
}

interface ProgressionData {
  rounds: string[];
  matches: Match[];
  currentRound: string;
  status: string;
}

// Custom Button component using Tailwind CSS
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary",
  size = "md",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const baseClasses = "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Custom Select component using Tailwind CSS
const Select = ({ 
  value, 
  onValueChange, 
  children, 
  placeholder = "Select option",
  className = ""
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
};

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

// Custom Card component using Tailwind CSS
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Custom Badge component using Tailwind CSS
const Badge = ({ 
  children, 
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Custom Alert component using Tailwind CSS
const Alert = ({ 
  children, 
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) => {
  const baseClasses = "p-4 rounded-md border";
  
  const variantClasses = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);

// Custom icons using simple SVG or text
const Loader2 = ({ className = "animate-spin h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const CheckCircle = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircle = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Info = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function TournamentProgression({ tournamentId, onClose }: TournamentProgressionProps) {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Generate CSRF token on component mount
  useEffect(() => {
    setCsrfToken(crypto.randomUUID());
  }, []);

  // Get session ID from localStorage
  const getSessionId = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSessionId');
    }
    return null;
  };

  const fetchProgression = async () => {
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch(`/api/admin/tournament-progression?tournamentId=${tournamentId}`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgression(data.progression);
        setMatches(data.matches);
        setMessage(null); // Clear previous messages
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to fetch progression data' });
      }
    } catch (error: any) {
      console.error('Error fetching progression:', error);
      setMessage({ type: 'error', text: 'Failed to fetch progression data' });
    }
  };

  const getAvailableRounds = (): string[] => {
    if (progression?.rounds && progression.rounds.length > 0) {
      return progression.rounds;
    }
    // Fallback to standard tournament rounds
    return ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final", "3rd Place Match"];
  };

  const handleRoundChange = (round: string) => {
    setSelectedRound(round);
    if (progression) {
      const roundMatches = progression.matches.filter(m => m.round === round);
      setMatches(roundMatches);
    }
  };

  const populateRound32Matches = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'populateRound32'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Round of 32 matches populated successfully!' });
        
        // Refresh progression data after a short delay
        setTimeout(() => {
          fetchProgression();
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to populate matches' });
      }
    } catch (error: any) {
      console.error('Error populating matches:', error);
      setMessage({ type: 'error', text: 'Failed to populate matches' });
    } finally {
      setLoading(false);
    }
  };

  const populateRound16Matches = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'populateRound16'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Round of 16 matches populated successfully!' });
        
        setTimeout(() => {
          fetchProgression();
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to populate matches' });
      }
    } catch (error: any) {
      console.error('Error populating matches:', error);
      setMessage({ type: 'error', text: 'Failed to populate matches' });
    } finally {
      setLoading(false);
    }
  };

  const fixProgression = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'fixProgression'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Tournament progression fixed successfully!' });
        
        setTimeout(() => {
          fetchProgression();
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to fix progression' });
      }
    } catch (error: any) {
      console.error('Error fixing progression:', error);
      setMessage({ type: 'error', text: 'Failed to fix progression' });
    } finally {
      setLoading(false);
    }
  };

  const validateIntegrity = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'validateIntegrity'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'info', text: data.message || 'Data integrity check completed' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to validate integrity' });
      }
    } catch (error: any) {
      console.error('Error validating integrity:', error);
      setMessage({ type: 'error', text: 'Failed to validate integrity' });
    } finally {
      setLoading(false);
    }
  };

  const regenerateProgression = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'regenerateProgression'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Tournament progression regenerated successfully!' });
        
        setTimeout(() => {
          fetchProgression();
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to regenerate progression' });
      }
    } catch (error: any) {
      console.error('Error regenerating progression:', error);
      setMessage({ type: 'error', text: 'Failed to regenerate progression' });
    } finally {
      setLoading(false);
    }
  };

  const clearSchedule = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("adminSessionId");
      if (!sessionId) {
        setMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        return;
      }

      const response = await fetch('/api/admin/tournament-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tournamentId,
          action: 'clearSchedule'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Tournament schedule cleared successfully!' });
        
        setTimeout(() => {
          fetchProgression();
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to clear schedule' });
      }
    } catch (error: any) {
      console.error('Error clearing schedule:', error);
      setMessage({ type: 'error', text: 'Failed to clear schedule' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgression();
  }, [tournamentId]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tournament Progression Management</h2>
          <Button onClick={onClose} variant="secondary">✕</Button>
        </div>

        {message && (
          <Alert className={`mb-4 ${getMessageColor(message.type)}`}>
            {getMessageIcon(message.type)}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progression Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Round:</label>
                  <Select value={selectedRound} onValueChange={handleRoundChange}>
                    <SelectItem value="">Choose a round...</SelectItem>
                    {getAvailableRounds().map((round) => (
                        <SelectItem key={round} value={round}>
                          {round}
                        </SelectItem>
                      ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={populateRound32Matches} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Populate Round of 32
                  </Button>
                  
                  <Button 
                    onClick={populateRound16Matches} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Populate Round of 16
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={fixProgression} 
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Fix Progression
                  </Button>
                  
                  <Button 
                    onClick={validateIntegrity} 
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Validate Data
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={regenerateProgression} 
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Regenerate
                  </Button>
                  
                  <Button 
                    onClick={clearSchedule} 
                    disabled={loading}
                    variant="danger"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Clear Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progression Status */}
            {progression && (
              <Card>
                <CardHeader>
                  <CardTitle>Progression Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Round:</span>
                    <Badge variant="info">{progression.currentRound || 'Not Started'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={progression.status === 'active' ? 'default' : 'info'}>
                      {progression.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Rounds:</span>
                    <Badge variant="default">{progression.rounds?.length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Matches Table */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  Matches for {selectedRound || 'Select a Round'}
                  {matches.length > 0 && (
                    <Badge variant="info" className="ml-2">
                      {matches.length} matches
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRound ? (
                  matches.length > 0 ? (
                    <div className="space-y-3">
                      {matches.map((match) => (
                        <div key={match.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              Match {match.id}
                            </span>
                            <Badge variant={match.isCompleted ? 'default' : 'info'}>
                              {match.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Players:</span> {match.players.join(' vs ')}
                            </div>
                            {match.winner && (
                              <div className="text-sm">
                                <span className="font-medium">Winner:</span> {match.winner}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No matches found for this round
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Please select a round to view matches
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Tournament ID: {tournamentId}</div>
                  <div>Selected Round: {selectedRound || 'None'}</div>
                  <div>Matches Count: {matches.length}</div>
                  <div>Progression Status: {progression?.status || 'Unknown'}</div>
                  <div>CSRF Token: {csrfToken.substring(0, 8)}...</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
