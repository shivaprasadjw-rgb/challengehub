#!/bin/bash

# Database Cleanup Script for Local Development
# This script cleans duplicate data from your local PostgreSQL database

echo "🧹 Starting Local Database Cleanup..."

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

# Function to execute SQL commands
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "📝 $description..."
    
    # Extract connection details from DATABASE_URL
    # Format: postgresql://username:password@host:port/database
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
echo "📤 Creating backup..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
echo "✅ Backup created: $BACKUP_FILE"

# Show current counts
echo "📊 Current data counts:"
execute_sql "SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations;" "Getting current counts"

# Clean duplicate tournaments
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, date ORDER BY \"createdAt\" ASC) as rn
    FROM tournaments
)
DELETE FROM tournaments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate tournaments"

# Clean duplicate organizers
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY \"createdAt\" ASC) as rn
    FROM organizers
)
DELETE FROM organizers 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate organizers"

# Clean duplicate venues
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, \"organizerId\" ORDER BY \"createdAt\" ASC) as rn
    FROM venues
)
DELETE FROM venues 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate venues"

# Clean duplicate registrations
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"playerEmail\", \"tournamentId\" ORDER BY \"registeredAt\" ASC) as rn
    FROM registrations
)
DELETE FROM registrations 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate registrations"

# Clean duplicate judges
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"fullName\", \"organizerId\" ORDER BY \"createdAt\" ASC) as rn
    FROM judges
)
DELETE FROM judges 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate judges"

# Clean duplicate payments
execute_sql "
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY \"organizerId\", \"tournamentId\", amount ORDER BY \"createdAt\" ASC) as rn
    FROM payments
)
DELETE FROM payments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);" "Cleaning duplicate payments"

# Show final counts
echo "📊 Final data counts:"
execute_sql "SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations UNION ALL SELECT 'Judges', COUNT(*) FROM judges UNION ALL SELECT 'Payments', COUNT(*) FROM payments;" "Getting final counts"

# Clean up orphaned records
echo "🧹 Cleaning orphaned records..."

# Remove registrations for non-existent tournaments
execute_sql "
DELETE FROM registrations 
WHERE \"tournamentId\" NOT IN (SELECT id FROM tournaments);" "Removing orphaned registrations"

# Remove tournaments for non-existent organizers
execute_sql "
DELETE FROM tournaments 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned tournaments"

# Remove venues for non-existent organizers
execute_sql "
DELETE FROM venues 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned venues"

# Remove judges for non-existent organizers
execute_sql "
DELETE FROM judges 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned judges"

# Remove payments for non-existent organizers
execute_sql "
DELETE FROM payments 
WHERE \"organizerId\" NOT IN (SELECT id FROM organizers);" "Removing orphaned payments"

# Remove payments for non-existent tournaments
execute_sql "
DELETE FROM payments 
WHERE \"tournamentId\" IS NOT NULL AND \"tournamentId\" NOT IN (SELECT id FROM tournaments);" "Removing payments for non-existent tournaments"

echo "✅ Local database cleanup completed!"
echo "📁 Backup file: $BACKUP_FILE"
echo "🎯 You can now export clean data and sync to production"
