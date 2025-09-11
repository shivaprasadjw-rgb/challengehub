# Sports India Events Platform

A comprehensive tournament management platform built with Next.js, featuring organizer management, tournament creation, and participant registration.

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and auth configuration
   ```

3. **Set up Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

### 🐙 GitHub Deployment

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sports-india-events.git
   git push -u origin main
   ```

2. **Push Updates**
   ```bash
   git add .
   git commit -m "Update features"
   git push
   ```

### ☁️ Vercel Deployment

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all environment variables from `.env.local`
   - Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── organizer/         # Organizer dashboard
│   └── tournaments/       # Tournament pages
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Features

- ✅ Tournament Management
- ✅ Organizer Dashboard
- ✅ Participant Registration
- ✅ Venue Management
- ✅ Judge Assignment
- ✅ Tournament Progression
- ✅ Admin Panel
- ✅ Analytics Dashboard

## 🔧 Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_GITHUB_ID` - GitHub OAuth ID (optional)
- `NEXTAUTH_GITHUB_SECRET` - GitHub OAuth Secret (optional)

## 🚀 Production Ready

This project is production-ready with:
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Optimized build process
- ✅ Responsive design
- ✅ Error handling
- ✅ Security best practices

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.
