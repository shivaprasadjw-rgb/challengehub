# Deployment Guide - Sports India Events

This guide will help you deploy the Sports India Events tournament management system to production.

## 🚀 Quick Deployment (Vercel)

### 1. Prerequisites
- GitHub account
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or Railway)

### 2. Database Setup

#### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the connection string

#### Option B: Supabase
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

#### Option C: Railway
1. Go to [Railway](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string

### 3. Vercel Deployment

1. **Fork/Clone the repository**
   ```bash
   git clone https://github.com/your-username/sports-india-events.git
   cd sports-india-events
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Wait for the build to complete
   - Your app will be live at `https://your-domain.vercel.app`

### 4. Database Migration

After deployment, run database migrations:
```bash
# In Vercel dashboard > Functions > Create new function
# Or use Vercel CLI
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

## 🔧 Manual Deployment

### 1. Server Requirements
- Node.js 18+
- PostgreSQL 14+
- 1GB RAM minimum
- 10GB storage

### 2. Server Setup

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### CentOS/RHEL
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo yum install postgresql postgresql-server -y
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-username/sports-india-events.git
cd sports-india-events

# Install dependencies
npm install

# Build application
npm run build

# Set environment variables
cp .env.example .env
# Edit .env with your production values

# Run database migrations
npx prisma generate
npx prisma db push
npx prisma db seed

# Start application with PM2
pm2 start npm --name "sports-india-events" -- start
pm2 save
pm2 startup
```

### 4. Nginx Configuration

Create `/etc/nginx/sites-available/sports-india-events`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/sports-india-events /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Security Configuration

### 1. Environment Variables
```env
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-very-long-random-secret
NEXTAUTH_URL=https://your-domain.com
```

### 2. Database Security
```sql
-- Create dedicated database user
CREATE USER sports_app WITH PASSWORD 'strong_password';
CREATE DATABASE sports_india OWNER sports_app;
GRANT ALL PRIVILEGES ON DATABASE sports_india TO sports_app;
```

### 3. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📊 Monitoring & Maintenance

### 1. Health Checks
```bash
# Application health
curl -f http://localhost:3000/api/health

# Database connectivity
npx prisma db execute --stdin <<< "SELECT 1;"
```

### 2. Logs
```bash
# Application logs
pm2 logs sports-india-events

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump sports_india > backup_$DATE.sql
gzip backup_$DATE.sql
# Upload to cloud storage
```

### 4. Updates
```bash
# Update application
git pull origin main
npm install
npm run build
pm2 restart sports-india-events

# Update dependencies
npm audit fix
npm update
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **Build Errors**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

3. **Performance Issues**
   - Check server resources
   - Optimize database queries
   - Enable caching

4. **SSL Issues**
   - Verify domain DNS settings
   - Check certificate expiration
   - Renew certificates if needed

## 📞 Support

For deployment issues:
- Check application logs
- Review error messages
- Contact support team
- Create GitHub issue

---

**Last Updated**: January 2025  
**Version**: 1.0.0
