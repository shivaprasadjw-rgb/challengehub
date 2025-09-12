#!/bin/bash

# Complete Database Reset Script for Local Development
# This script completely resets your local database and seeds it with clean data

echo "💥 Starting Complete Local Database Reset..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found. Please create it with your DATABASE_URL"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    exit 1
fi

echo "📊 Current database connection: ${DATABASE_URL}"

# Safety confirmation
echo "⚠️  WARNING: This will COMPLETELY RESET your local database!"
echo "📊 Target database: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Create backup first
echo "📤 Creating backup before reset..."
BACKUP_FILE="pre-reset-backup-$(date +%Y%m%d-%H%M%S).sql"

# Extract connection details from DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2)

PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"

# Reset database using Prisma
echo "🔄 Resetting database schema..."
npx prisma db push --force-reset --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Database schema reset completed"
else
    echo "❌ Database schema reset failed"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

# Seed database with clean data
echo "🌱 Seeding database with clean data..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Database seeding failed"
    exit 1
fi

# Verify the reset
echo "📊 Verifying database reset..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'Tournaments' as table_name, COUNT(*) as count FROM tournaments 
UNION ALL 
SELECT 'Organizers', COUNT(*) FROM organizers 
UNION ALL 
SELECT 'Venues', COUNT(*) FROM venues 
UNION ALL 
SELECT 'Registrations', COUNT(*) FROM registrations 
UNION ALL 
SELECT 'Judges', COUNT(*) FROM judges 
UNION ALL 
SELECT 'Payments', COUNT(*) FROM payments 
UNION ALL 
SELECT 'Users', COUNT(*) FROM users;
"

echo "✅ Complete local database reset completed!"
echo "📁 Backup file: $BACKUP_FILE"
echo "🎯 Local database is now clean and ready for development"
