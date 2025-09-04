# Sports India Events - Tournament Management System

A modern, full-stack tournament management platform built with Next.js, TypeScript, and Prisma. Manage sports tournaments, registrations, and real-time progression tracking.

## 🏆 Features

### Tournament Management
- **Complete Tournament Lifecycle**: Create, manage, and track tournaments from registration to completion
- **Real-time Progression**: Live tournament bracket updates with automatic round advancement
- **Multi-sport Support**: Badminton, Tennis, and other sports with customizable formats
- **Venue Management**: Integrated venue system with Google Maps integration
- **Registration System**: Player registration with payment tracking and capacity management

### Admin Features
- **Organizer Dashboard**: Comprehensive admin interface for tournament management
- **Judge Assignment**: Assign judges to matches with real-time updates
- **Excel Import/Export**: Bulk registration management with Excel support
- **Analytics**: Tournament statistics and participant analytics
- **Deadline Management**: Automated registration deadline enforcement

### User Features
- **Public Tournament Browser**: Search and filter tournaments by sport, location, date
- **Real-time Results**: Live match updates and tournament progression
- **Mobile Responsive**: Optimized for all devices
- **Social Sharing**: Share tournaments on social media platforms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sports-india-events.git
   cd sports-india-events
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sports_india"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── organizer/         # Organizer interface
│   └── tournament/        # Public tournament pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and types
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

## 📊 Database Schema

The application uses a comprehensive database schema with the following main entities:
- **Tournaments**: Tournament details, status, and configuration
- **Registrations**: Player registrations with payment status
- **Rounds**: Tournament rounds and progression
- **Matches**: Individual matches with results and scheduling
- **Venues**: Tournament venues with location data
- **Organizers**: Tournament organizers and administrators

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check    # Run TypeScript type checking
```

### Database Management
```bash
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push    # Push schema changes
npx prisma db seed   # Seed database with sample data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@sportsindiaevents.com

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Live streaming integration
- [ ] Tournament templates
- [ ] Automated scheduling algorithms

---

Built with ❤️ for the sports community in India
