#!/bin/bash

# Database Cleanup Script for Production Database
# This script cleans duplicate data from your production PostgreSQL database

echo "🧹 Starting Production Database Cleanup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found."
    echo "Please create it with your production DATABASE_URL"
    echo "Example: DATABASE_URL=postgresql://user:pass@host:port/db"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.production"
    exit 1
fi

echo "📊 Production database connection: ${DATABASE_URL}"

# Safety confirmation
echo "⚠️  WARNING: This will modify your PRODUCTION database!"
echo "📊 Current production database: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Function to execute SQL commands
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "📝 $description..."
    
    # Extract connection details from DATABASE_URL
    DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
    DB_USER=$(echo $DB_URL | cut -d':' -f1)
    DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
    DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
    DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
    DB_NAME=$(echo $DB_URL | cut -d'/' -f2)
    
    # Execute SQL using psql
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$sql"
    
    if [ $? -eq 0 ]; then
        echo "✅ $description completed successfully"
    else
        echo "❌ $description failed"
        exit 1
    fi
}

# Create backup first
echo "📤 Creating production backup..."
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).sql"
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
echo "✅ Production backup created: $BACKUP_FILE"

# Show current counts
echo "📊 Current production data counts:"
execute_sql "SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations UNION ALL SELECT 'Judges', COUNT(*) FROM judges UNION ALL SELECT 'Payments', COUNT(*) FROM payments;" "Getting current production counts"

# Clean duplicate tournaments
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, date ORDER BY \"createdAt\" ASC) as rn
    FROM tournaments
)
DELETE FROM tournaments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate tournaments in production"

# Clean duplicate organizers
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY \"createdAt\" ASC) as rn
    FROM organizers
)
DELETE FROM organizers 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate organizers in production"

# Clean duplicate venues
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, \"organizerId\" ORDER BY \"createdAt\" ASC) as rn
    FROM venues
)
DELETE FROM venues 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate venues in production"

# Clean duplicate registrations
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"playerEmail\", \"tournamentId\" ORDER BY \"registeredAt\" ASC) as rn
    FROM registrations
)
DELETE FROM registrations 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate registrations in production"

# Clean duplicate judges
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"fullName\", \"organizerId\" ORDER BY \"createdAt\" ASC) as rn
    FROM judges
)
DELETE FROM judges 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate judges in production"

# Clean duplicate payments
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"organizerId\", \"tournamentId\", amount ORDER BY \"createdAt\" ASC) as rn
    FROM payments
)
DELETE FROM payments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate payments in production"

# Clean up orphaned records
echo "🧹 Cleaning orphaned records in production..."

# Remove registrations for non-existent tournaments
execute_sql "
DELETE FROM registrations 
WHERE \"tournamentId\" NOT IN (SELECT id FROM tournaments);" "Removing orphaned registrations in production"

# Remove tournaments for non-existent organizers
execute_sql "
DELETE FROM tournaments 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned tournaments in production"

# Remove venues for non-existent organizers
execute_sql "
DELETE FROM venues 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned venues in production"

# Remove judges for non-existent organizers
execute_sql "
DELETE FROM judges 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned judges in production"

# Remove payments for non-existent organizers
execute_sql "
DELETE FROM payments 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned payments in production"

# Remove payments for non-existent tournaments
execute_sql "
DELETE FROM payments 
WHERE \"tournamentId\" IS NOT NULL AND \"tournamentId\" NOT IN (SELECT id FROM tournaments);" "Removing payments for non-existent tournaments in production"

# Show final counts
echo "📊 Final production data counts:"
execute_sql "SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations UNION ALL SELECT 'Judges', COUNT(*) FROM judges UNION ALL SELECT 'Payments', COUNT(*) FROM payments;" "Getting final production counts"

echo "✅ Production database cleanup completed!"
echo "📁 Production backup file: $BACKUP_FILE"
echo "🎯 Production database is now clean and ready for use"
