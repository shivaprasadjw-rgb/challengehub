# Deployment & Maintenance Guide - Tournament Progression System

## 🚀 Deployment Checklist

### Pre-Deployment Requirements

#### 1. Environment Setup
```bash
# Required environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/tournament_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### 2. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify database connection
npx prisma db seed
```

#### 3. Dependencies Installation
```bash
# Install all dependencies
npm install

# Install specific UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install lucide-react
```

### Production Deployment

#### 1. Build Process
```bash
# Build the application
npm run build

# Verify build output
npm run start
```

#### 2. Database Backup
```bash
# Create backup before deployment
pg_dump tournament_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup integrity
pg_restore --list backup_file.sql
```

#### 3. Zero-Downtime Deployment
```bash
# Deploy to staging first
npm run deploy:staging

# Run smoke tests
npm run test:smoke

# Deploy to production
npm run deploy:production
```

## 🔧 Maintenance Procedures

### Daily Monitoring

#### 1. Health Checks
```bash
# Check application health
curl -f http://localhost:3000/api/health

# Check database connectivity
npx prisma db execute --stdin <<< "SELECT 1;"

# Monitor error logs
tail -f logs/error.log
```

#### 2. Performance Monitoring
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Monitor database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Weekly Maintenance

#### 1. Database Optimization
```sql
-- Analyze table statistics
ANALYZE tournament;
ANALYZE tournament_round;
ANALYZE match;

-- Clean up old audit logs
DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '90 days';

-- Vacuum database
VACUUM ANALYZE;
```

#### 2. Log Rotation
```bash
# Rotate application logs
logrotate /etc/logrotate.d/tournament-app

# Archive old logs
tar -czf logs_$(date +%Y%m).tar.gz logs/
```

### Monthly Maintenance

#### 1. Security Updates
```bash
# Update dependencies
npm audit
npm update

# Update Prisma
npm update @prisma/client prisma

# Regenerate Prisma client
npx prisma generate
```

#### 2. Database Maintenance
```bash
# Full database backup
pg_dump --verbose --clean --no-owner --no-privileges tournament_db > full_backup.sql

# Check for database corruption
REINDEX DATABASE tournament_db;

# Update table statistics
VACUUM FULL ANALYZE;
```

## 🛠️ Troubleshooting Guide

### Common Issues

#### 1. Tournament Progression Button Not Showing
```bash
# Check round status
npx tsx scripts/check-tournament-progression-status.ts

# Fix round completion status
npx tsx scripts/check-round-32-status.ts
```

#### 2. Database Connection Issues
```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT version();"

# Check connection pool
SELECT * FROM pg_stat_activity;

# Restart database service
sudo systemctl restart postgresql
```

#### 3. Memory Leaks
```bash
# Check memory usage
ps aux | grep node

# Monitor heap usage
node --inspect app.js

# Restart application
pm2 restart tournament-app
```

### Emergency Procedures

#### 1. Database Recovery
```bash
# Stop application
pm2 stop tournament-app

# Restore from backup
pg_restore --clean --no-owner tournament_db < backup_file.sql

# Verify data integrity
npx tsx scripts/verify-data-integrity.ts

# Restart application
pm2 start tournament-app
```

#### 2. Application Rollback
```bash
# Rollback to previous version
git checkout HEAD~1
npm install
npm run build
pm2 restart tournament-app
```

## 📊 Monitoring & Alerting

### Application Metrics

#### 1. Performance Metrics
```typescript
// Track API response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

#### 2. Error Tracking
```typescript
// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Log to external service
  logError(error, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Database Monitoring

#### 1. Query Performance
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### 2. Connection Monitoring
```sql
-- Check active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

## 🔒 Security Maintenance

### Regular Security Checks

#### 1. Dependency Vulnerabilities
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

#### 2. Database Security
```sql
-- Review user permissions
SELECT usename, usesuper, usecreatedb 
FROM pg_user;

-- Check for unused accounts
SELECT usename, last_login 
FROM pg_stat_user_tables;
```

#### 3. Application Security
```bash
# Check for exposed secrets
grep -r "password\|secret\|key" . --exclude-dir=node_modules

# Verify SSL certificates
openssl x509 -in certificate.crt -text -noout
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### 1. Load Balancer Setup
```nginx
# Nginx configuration
upstream tournament_app {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://tournament_app;
    }
}
```

#### 2. Database Scaling
```sql
-- Read replicas for read-heavy operations
-- Master database for writes
-- Connection pooling for better performance
```

### Vertical Scaling

#### 1. Resource Allocation
```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize database memory
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB
```

## 🔄 Backup & Recovery

### Automated Backups

#### 1. Database Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="tournament_db"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

#### 2. Application Backup
```bash
#!/bin/bash
# app_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/app_backups"

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /app/tournament-system/

# Backup configuration
cp /app/tournament-system/.env $BACKUP_DIR/env_$DATE
```

### Recovery Procedures

#### 1. Full System Recovery
```bash
# Stop all services
pm2 stop all
sudo systemctl stop postgresql

# Restore database
pg_restore --clean tournament_db < backup_file.sql

# Restore application
tar -xzf app_backup.tar.gz

# Restart services
sudo systemctl start postgresql
pm2 start all
```

## 📋 Maintenance Schedule

### Daily Tasks
- [ ] Check application health
- [ ] Monitor error logs
- [ ] Verify database connectivity
- [ ] Check disk space

### Weekly Tasks
- [ ] Database optimization
- [ ] Log rotation
- [ ] Security updates
- [ ] Performance monitoring

### Monthly Tasks
- [ ] Full database backup
- [ ] Dependency updates
- [ ] Security audit
- [ ] Performance review

### Quarterly Tasks
- [ ] System architecture review
- [ ] Capacity planning
- [ ] Disaster recovery testing
- [ ] Documentation updates

---

**This guide ensures reliable operation and easy maintenance of the tournament progression system in production.**
