# 🏆 Badminton Tournament Management System

A comprehensive tournament management platform built with Next.js, Prisma, and PostgreSQL. Features dynamic tournament progression, real-time match management, and organizer administration.

## ✨ Key Features

### 🎯 Tournament Progression System
- **Dynamic Round Generation**: Automatically creates appropriate rounds based on participant count (16, 32, 64+)
- **Real-time Match Management**: Update match results with winner and score
- **Automatic Progression**: Advance through tournament brackets with one click
- **3rd Place Match**: Automatically generated after Semifinal completion
- **Tournament Completion**: Proper handling of Final round and tournament status

### 👥 Role-Based Access Control
- **SUPER_ADMIN**: Global platform management and organizer oversight
- **ORG_USER**: Organizer-level tournament management and administration
- **Secure Authentication**: NextAuth.js with role-based route protection

### 🏢 Organizer Features
- **Tournament Creation**: Create tournaments with custom settings
- **Bulk Registration**: Import/export participant data via CSV
- **Team Management**: Add and manage organizer staff members
- **Judge Assignment**: Assign judges to matches and courts
- **Venue Management**: Manage tournament venues and facilities

### 📊 Admin Dashboard
- **Platform Overview**: Global statistics and insights
- **Organizer Applications**: Review and approve new organizers
- **Tournament Analytics**: Monitor tournament performance
- **User Management**: Manage platform users and permissions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tournament-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database and auth credentials
```

4. **Set up database**
```bash
npx prisma generate
npx prisma db push
```

5. **Start development server**
```bash
npm run dev
```

### Access URLs

- **Super Admin**: `http://localhost:3000/super-admin`
- **Organizer Dashboard**: `http://localhost:3000/organizer/[slug]/dashboard`
- **Tournament Management**: `http://localhost:3000/organizer/[slug]/tournaments`

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

## 🗄️ Database Schema

### Core Models
- **Tournament**: Main tournament entity with status and progression data
- **TournamentRound**: Individual rounds with completion status
- **Match**: Individual matches with players, results, and status
- **Registration**: Participant registrations with player details
- **Organizer**: Tournament organizers with approval status
- **User**: Platform users with role-based access

### Key Relationships
- Tournament → TournamentRound (one-to-many)
- TournamentRound → Match (one-to-many)
- Tournament → Registration (one-to-many)
- Organizer → Tournament (one-to-many)

## 🔄 Tournament Progression Workflow

### 1. Tournament Creation
```bash
# Create tournament with participants
# System automatically generates initial rounds
```

### 2. Tournament Initialization
```bash
# Click "Initialize Tournament" button
# System creates all rounds and matches
```

### 3. Match Management
```bash
# Click on "Ready" matches to update results
# Enter winner and score
# System updates match status
```

### 4. Round Progression
```bash
# Complete all matches in current round
# Click "Advance to Next Round"
# System generates next round matches
```

### 5. Tournament Completion
```bash
# Complete Final match
# System marks tournament as COMPLETED
# No more progression buttons shown
```

## 🎯 Round Generation Rules

### For 16 Participants:
1. **Round of 16** (8 matches)
2. **Quarterfinal** (4 matches)
3. **Semifinal** (2 matches)
4. **3rd Place Match** (1 match)
5. **Final** (1 match)

### For 32 Participants:
1. **Round of 32** (16 matches)
2. **Round of 16** (8 matches)
3. **Quarterfinal** (4 matches)
4. **Semifinal** (2 matches)
5. **3rd Place Match** (1 match)
6. **Final** (1 match)

## 🔧 API Endpoints

### Tournament Progression
- `GET /api/organizer/[slug]/tournaments/[id]/progression` - Fetch tournament data
- `POST /api/organizer/[slug]/tournaments/[id]/progression` - Update progression

### Tournament Management
- `GET /api/organizer/[slug]/tournaments` - List tournaments
- `POST /api/organizer/[slug]/tournaments` - Create tournament
- `PUT /api/organizer/[slug]/tournaments/[id]` - Update tournament
- `DELETE /api/organizer/[slug]/tournaments/[id]` - Delete tournament

### Registration Management
- `GET /api/organizer/[slug]/tournaments/[id]/registrations` - List registrations
- `POST /api/organizer/[slug]/tournaments/[id]/registrations/bulk` - Bulk import/export

## 🛠️ Development

### Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Debug Scripts
```bash
# Check tournament status
npx tsx scripts/check-tournament-progression-status.ts

# Fix round status
npx tsx scripts/check-round-32-status.ts

# Complete final match
npx tsx scripts/complete-final-match.ts
```

## 🔒 Security Features

- **Role-Based Access Control**: Different permissions for different user types
- **Route Protection**: Middleware-based route security
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Authentication**: NextAuth.js with secure session management

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl -f http://localhost:3000/api/health

# Database connectivity
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Backup Procedures
```bash
# Database backup
pg_dump tournament_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf app_backup.tar.gz /app/tournament-system/
```

## 📚 Documentation

- **[Tournament Progression Guide](docs/TOURNAMENT_PROGRESSION_GUIDE.md)** - Complete functionality documentation
- **[Technical Implementation](docs/TECHNICAL_IMPLEMENTATION.md)** - Developer guide
- **[Deployment & Maintenance](docs/DEPLOYMENT_MAINTENANCE.md)** - Production deployment guide

## 🧪 Testing

### Test Coverage
- Unit tests for core functions
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Database migration tests

### Test Commands
```bash
npm run test           # Run all tests
npm run test:unit      # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e       # Run end-to-end tests
```

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Load balancer configured
- [ ] Error tracking enabled

### Deployment Commands
```bash
npm run build          # Build application
npm run deploy:staging # Deploy to staging
npm run deploy:production # Deploy to production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Update documentation

## 📞 Support

### For Issues
1. Check the troubleshooting section in documentation
2. Run debug scripts to identify problems
3. Review error logs
4. Contact the development team

### For New Features
1. Follow existing code patterns
2. Update documentation
3. Add comprehensive tests
4. Verify database schema changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Success Stories

- **Elite Tennis Championship 2025**: Successfully managed 32 participants through complete tournament progression
- **Sports India Events**: Platform handling multiple organizers and tournaments simultaneously
- **Production Ready**: System deployed and running in production environment

---

**Last Updated**: August 31, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
