#!/bin/bash

# Complete Database Reset Script for Production
# This script completely resets your production database
# ⚠️ USE WITH EXTREME CAUTION - THIS WILL DELETE ALL PRODUCTION DATA

echo "💥 Starting Complete Production Database Reset..."

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

# Multiple safety confirmations
echo "🚨 DANGER: This will COMPLETELY DELETE ALL PRODUCTION DATA!"
echo "📊 Target production database: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
echo ""
echo "This action is IRREVERSIBLE and will:"
echo "- Delete ALL tournaments"
echo "- Delete ALL organizers"
echo "- Delete ALL venues"
echo "- Delete ALL registrations"
echo "- Delete ALL judges"
echo "- Delete ALL payments"
echo "- Delete ALL audit logs"
echo "- Keep users (for authentication)"
echo ""

read -p "Type 'DELETE ALL PRODUCTION DATA' to confirm: " confirm1

if [ "$confirm1" != "DELETE ALL PRODUCTION DATA" ]; then
    echo "❌ Operation cancelled - confirmation text did not match"
    exit 1
fi

read -p "Are you absolutely sure? Type 'YES' to proceed: " confirm2

if [ "$confirm2" != "YES" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Create comprehensive backup
echo "📤 Creating comprehensive production backup..."
BACKUP_FILE="production-full-backup-$(date +%Y%m%d-%H%M%S).sql"

# Extract connection details from DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2)

PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
echo "✅ Comprehensive backup created: $BACKUP_FILE"

# Show current counts before deletion
echo "📊 Current production data counts (before deletion):"
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

# Delete all data (except users)
echo "🗑️ Deleting all production data..."

PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- Delete in order to respect foreign key constraints
DELETE FROM registrations;
DELETE FROM tournaments;
DELETE FROM venues;
DELETE FROM judges;
DELETE FROM payments;
DELETE FROM audit_logs;
DELETE FROM organizer_applications;
DELETE FROM user_organizers;
-- Keep users for authentication
"

if [ $? -eq 0 ]; then
    echo "✅ All production data deleted successfully"
else
    echo "❌ Failed to delete production data"
    exit 1
fi

# Show final counts
echo "📊 Final production data counts (after deletion):"
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

echo "✅ Complete production database reset completed!"
echo "📁 Comprehensive backup file: $BACKUP_FILE"
echo "🎯 Production database is now empty and ready for clean data import"
echo ""
echo "⚠️  Next steps:"
echo "1. Import clean data using: ./scripts/import-clean-data.sh"
echo "2. Test your production site"
echo "3. Keep the backup file safe"
