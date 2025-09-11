# Sports India Events - Deployment Instructions

## 🚀 Quick Deployment Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Vercel Postgres)
- GitHub account
- Vercel account

### Step 1: Local Setup
```bash
# Extract the ZIP file
unzip sports-india-events-deployment.zip
cd sports-india-events-deployment

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your database URL and secrets
```

### Step 2: Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed
```

### Step 3: Test Locally
```bash
# Run development server
npm run dev

# Visit http://localhost:3000
```

### Step 4: Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure
```

#### Option B: Via GitHub + Vercel Dashboard
1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sports-india-events.git
   git push -u origin main
   ```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

### Step 5: Environment Variables (Required)
Set these in Vercel dashboard:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret string
- `NEXTAUTH_URL` - Your Vercel app URL

### Step 6: Database Migration
After deployment, run:
```bash
npx prisma db push
```

## ✅ Verification
- Homepage loads: `https://your-app.vercel.app`
- API health check: `https://your-app.vercel.app/api/health`
- About page: `https://your-app.vercel.app/about`

## 🛠️ Features Included
- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ Prisma ORM with PostgreSQL
- ✅ NextAuth.js authentication
- ✅ API routes
- ✅ Responsive design
- ✅ Production-ready build

## 📞 Support
If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Ensure database is accessible
4. Check Prisma schema compatibility

**Your Sports India Events platform is now ready for production!** 🎉
