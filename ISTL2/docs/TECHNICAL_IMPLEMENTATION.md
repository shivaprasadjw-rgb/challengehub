# Technical Implementation Guide - Tournament Progression System

## Architecture Overview

The Tournament Progression System is built on Next.js with Prisma ORM and PostgreSQL. It follows a modular architecture with clear separation of concerns.

## 🏗️ System Architecture

```
Frontend (Next.js) → API Routes → Prisma ORM → PostgreSQL
     ↓
TournamentProgression.tsx
     ↓
/api/organizer/[slug]/tournaments/[id]/progression
     ↓
Tournament Progression Logic
     ↓
Database Operations
```

## 🔧 Core Components

### 1. Frontend Component
**File**: `components/TournamentProgression.tsx`

#### Key Functions:
```typescript
// Fetch tournament data
const fetchTournamentProgression = async () => {
  const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`);
  const data = await response.json();
  setTournament(data.tournament);
};

// Update match result
const updateMatchResult = async () => {
  const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_match',
      data: { matchId: selectedMatch.id, winner: matchResult.winner, score: matchResult.score }
    })
  });
};

// Advance round
const advanceRound = async (roundName: string) => {
  const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/progression`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'advance_round',
      data: { currentRound: roundName }
    })
  });
};
```

### 2. API Route
**File**: `app/api/organizer/[slug]/tournaments/[id]/progression/route.ts`

#### Route Structure:
```typescript
export async function GET(request: Request, { params }: { params: { slug: string, id: string } }) {
  // Fetch tournament progression data
}

export async function POST(request: Request, { params }: { params: { slug: string, id: string } }) {
  const { action, data } = await request.json();
  
  switch (action) {
    case 'initialize':
      return await initializeTournament(params.id);
    case 'update_match':
      return await updateMatch(params.id, data);
    case 'advance_round':
      return await advanceRound(params.id, data);
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  }
}
```

## 🗄️ Database Operations

### Tournament Initialization
```typescript
async function initializeTournament(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { registrations: true }
  });

  const participantCount = tournament.registrations.length;
  const rounds = generateRounds(participantCount);
  
  // Create rounds
  for (const round of rounds) {
    await prisma.tournamentRound.create({
      data: {
        tournamentId,
        name: round.name,
        order: round.order,
        maxMatches: round.maxMatches
      }
    });
  }

  // Create initial matches
  const firstRound = rounds[0];
  const participants = tournament.registrations.map(r => r.playerName);
  await createMatches(tournamentId, firstRound.id, participants);
}
```

### Round Generation Logic
```typescript
function generateRounds(participantCount: number) {
  const rounds = [];
  let currentParticipants = participantCount;
  let order = 1;

  while (currentParticipants > 1) {
    const roundName = getRoundName(currentParticipants);
    const maxMatches = Math.floor(currentParticipants / 2);
    
    rounds.push({
      name: roundName,
      order: order++,
      maxMatches
    });
    
    currentParticipants = maxMatches;
  }

  // Add 3rd Place Match for tournaments with 4+ participants
  if (participantCount >= 4) {
    rounds.push({
      name: '3rd Place Match',
      order: order++,
      maxMatches: 1
    });
  }

  return rounds;
}

function getRoundName(participantCount: number) {
  switch (participantCount) {
    case 32: return 'Round of 32';
    case 16: return 'Round of 16';
    case 8: return 'Quarterfinal';
    case 4: return 'Semifinal';
    case 2: return 'Final';
    default: return `Round of ${participantCount}`;
  }
}
```

### Match Creation
```typescript
async function createMatches(tournamentId: string, roundId: string, participants: string[]) {
  const matches = [];
  
  for (let i = 0; i < participants.length; i += 2) {
    if (i + 1 < participants.length) {
      matches.push({
        tournamentId,
        roundId,
        player1: participants[i],
        player2: participants[i + 1],
        matchCode: generateMatchCode(roundId, Math.floor(i/2) + 1),
        isCompleted: false
      });
    }
  }

  await prisma.match.createMany({ data: matches });
}
```

### Round Advancement
```typescript
async function advanceRound(tournamentId: string, data: { currentRound: string }) {
  const currentRound = await prisma.tournamentRound.findFirst({
    where: { 
      tournamentId,
      name: data.currentRound
    }
  });

  // Mark current round as completed
  await prisma.tournamentRound.update({
    where: { id: currentRound.id },
    data: { 
      isCompleted: true,
      completedAt: new Date()
    }
  });

  // Get next round
  const nextRound = await prisma.tournamentRound.findFirst({
    where: {
      tournamentId,
      order: currentRound.order + 1
    }
  });

  if (nextRound) {
    // Generate matches for next round
    const winners = await getWinnersFromRound(currentRound.id);
    await createMatches(tournamentId, nextRound.id, winners);

    // Update tournament current round
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { currentRound: nextRound.name }
    });
  }
}
```

## 🔒 State Management

### Tournament States
```typescript
enum TournamentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### Round States
```typescript
interface TournamentRound {
  isCompleted: boolean;
  completedAt: DateTime | null;
  completedBy: string | null;
}
```

### Match States
```typescript
interface Match {
  isCompleted: boolean;
  winner: string | null;
  score: string | null;
  completedAt: DateTime | null;
}
```

## 🎯 UI Logic Implementation

### Button Visibility Logic
```typescript
const shouldShowAdvanceButton = (round: TournamentRound, tournament: Tournament) => {
  const isCurrentRound = tournament.currentRound === round.name;
  const allMatchesCompleted = round.matches.length > 0 && 
    round.matches.every(m => m.isCompleted);
  const roundNotCompleted = !round.isCompleted;
  const notFinal = round.name !== 'Final';
  const tournamentNotCompleted = tournament.status !== 'COMPLETED';

  return (isCurrentRound || (allMatchesCompleted && roundNotCompleted)) && 
         notFinal && tournamentNotCompleted;
};
```

### Match Click Handler
```typescript
const isMatchClickable = (match: Match) => {
  return !match.isCompleted && match.player1 && match.player2;
};

const handleMatchClick = (match: Match) => {
  if (isMatchClickable(match)) {
    openMatchDialog(match);
  }
};
```

## 🛠️ Error Handling

### Database Transaction Safety
```typescript
async function safeDatabaseOperation(operation: () => Promise<any>) {
  try {
    return await prisma.$transaction(operation);
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error('Operation failed. Please try again.');
  }
}
```

### Validation Functions
```typescript
function validateMatchResult(data: { winner: string; score: string }) {
  if (!data.winner || !data.score) {
    throw new Error('Winner and score are required');
  }
  
  if (!/^\d+-\d+$/.test(data.score)) {
    throw new Error('Score must be in format "21-15"');
  }
}

function validateRoundAdvancement(round: TournamentRound) {
  const incompleteMatches = round.matches.filter(m => !m.isCompleted);
  if (incompleteMatches.length > 0) {
    throw new Error(`Round has ${incompleteMatches.length} incomplete matches`);
  }
}
```

## 🔄 Performance Optimizations

### Database Queries
```typescript
// Optimized tournament fetch with all related data
const tournament = await prisma.tournament.findUnique({
  where: { id: tournamentId },
  include: {
    rounds: {
      include: {
        matches: {
          include: {
            judge: true
          },
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    },
    registrations: {
      select: {
        playerName: true,
        playerEmail: true
      }
    }
  }
});
```

### Caching Strategy
```typescript
// Cache tournament data to reduce API calls
const [tournament, setTournament] = useState<TournamentProgressionData | null>(null);

useEffect(() => {
  fetchTournamentProgression();
}, [tournamentId]); // Only refetch when tournament ID changes
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('Tournament Progression', () => {
  test('should generate correct rounds for 32 participants', () => {
    const rounds = generateRounds(32);
    expect(rounds).toHaveLength(6); // Round of 32, 16, QF, SF, 3rd Place, Final
  });

  test('should advance round correctly', async () => {
    const result = await advanceRound(tournamentId, { currentRound: 'Round of 32' });
    expect(result.currentRound).toBe('Round of 16');
  });
});
```

### Integration Tests
```typescript
describe('API Integration', () => {
  test('should complete full tournament progression', async () => {
    // Initialize tournament
    await initializeTournament(tournamentId);
    
    // Complete all matches
    await completeAllMatches(tournamentId);
    
    // Verify completion
    const tournament = await getTournament(tournamentId);
    expect(tournament.status).toBe('COMPLETED');
  });
});
```

## 📊 Monitoring & Logging

### Audit Trail
```typescript
async function logTournamentAction(action: string, data: any, userId: string) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType: 'TOURNAMENT',
      entityId: data.tournamentId,
      userId,
      details: JSON.stringify(data),
      timestamp: new Date()
    }
  });
}
```

### Error Logging
```typescript
function logError(error: Error, context: string) {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}
```

## 🔐 Security Considerations

### Input Validation
```typescript
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateTournamentAccess(tournamentId: string, userId: string) {
  const membership = await prisma.userOrganizer.findFirst({
    where: {
      userId,
      organizer: {
        tournaments: {
          some: { id: tournamentId }
        }
      }
    }
  });
  
  if (!membership) {
    throw new Error('Access denied');
  }
}
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const progressionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

---

**This technical guide ensures the tournament progression system is maintainable, scalable, and robust for production use.**
