#!/bin/bash

# Data Import Script for Production Database
# This script imports clean data from local export to production database

echo "📥 Starting Clean Data Import to Production..."

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

echo "📊 Importing to production database: ${DATABASE_URL}"

# Check if exports directory exists
if [ ! -d "exports" ]; then
    echo "❌ Error: exports directory not found. Please export clean data first."
    exit 1
fi

# Find the most recent export file
EXPORT_FILE=$(ls -t exports/clean-data-*.json 2>/dev/null | head -n1)

if [ -z "$EXPORT_FILE" ]; then
    echo "❌ Error: No clean data export found in exports/ directory"
    echo "Please run: ./scripts/export-clean-data.sh"
    exit 1
fi

echo "📂 Using export file: $EXPORT_FILE"

# Extract connection details from DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2)

# Safety confirmation
echo "⚠️  WARNING: This will import data to your PRODUCTION database!"
echo "📊 Target production database: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
echo "📂 Source file: $EXPORT_FILE"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

# Create backup before import
echo "📤 Creating production backup before import..."
BACKUP_FILE="production-pre-import-backup-$(date +%Y%m%d-%H%M%S).sql"
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
echo "✅ Production backup created: $BACKUP_FILE"

# Parse JSON and create SQL insert statements
echo "📝 Parsing export file and creating import statements..."

# Create a temporary SQL file for imports
TEMP_SQL="temp_import.sql"

# Use Node.js to parse JSON and generate SQL
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$EXPORT_FILE', 'utf8'))[0];

console.log('-- Import statements for clean data');
console.log('-- Generated on', new Date().toISOString());
console.log('');

// Import organizers first
if (data.organizers && data.organizers.length > 0) {
    console.log('-- Importing organizers');
    data.organizers.forEach(org => {
        const values = [
            org.id,
            org.name,
            org.slug,
            org.status,
            org.ownerUserId,
            JSON.stringify(org.contact),
            org.oneTimeFeePaidAt ? new Date(org.oneTimeFeePaidAt).toISOString() : null,
            new Date(org.createdAt).toISOString(),
            new Date(org.updatedAt).toISOString()
        ];
        console.log(\`INSERT INTO organizers (id, name, slug, status, \"ownerUserId\", contact, \"oneTimeFeePaidAt\", \"createdAt\", \"updatedAt\`) VALUES ('\${values[0]}', '\${values[1]}', '\${values[2]}', '\${values[3]}', '\${values[4]}', '\${values[5]}', \${values[6] ? \"'\" + values[6] + \"'\" : 'NULL'}, '\${values[7]}', '\${values[8]}');\`);
    });
    console.log('');
}

// Import venues
if (data.venues && data.venues.length > 0) {
    console.log('-- Importing venues');
    data.venues.forEach(venue => {
        const values = [
            venue.id,
            venue.organizerId,
            venue.name,
            venue.locality,
            venue.city,
            venue.state,
            venue.pincode,
            venue.address,
            new Date(venue.createdAt).toISOString(),
            new Date(venue.updatedAt).toISOString()
        ];
        console.log(\`INSERT INTO venues (id, \"organizerId\", name, locality, city, state, pincode, address, \"createdAt\", \"updatedAt\`) VALUES ('\${values[0]}', '\${values[1]}', '\${values[2]}', '\${values[3]}', '\${values[4]}', '\${values[5]}', '\${values[6]}', '\${values[7]}', '\${values[8]}', '\${values[9]}');\`);
    });
    console.log('');
}

// Import tournaments
if (data.tournaments && data.tournaments.length > 0) {
    console.log('-- Importing tournaments');
    data.tournaments.forEach(tournament => {
        const values = [
            tournament.id,
            tournament.organizerId,
            tournament.title,
            tournament.sport,
            new Date(tournament.date).toISOString(),
            tournament.entryFee,
            tournament.maxParticipants,
            tournament.status,
            tournament.venueId,
            tournament.currentRound,
            tournament.progressionData ? JSON.stringify(tournament.progressionData) : null,
            new Date(tournament.createdAt).toISOString(),
            new Date(tournament.updatedAt).toISOString()
        ];
        console.log(\`INSERT INTO tournaments (id, \"organizerId\", title, sport, date, \"entryFee\", \"maxParticipants\", status, \"venueId\", \"currentRound\", \"progressionData\", \"createdAt\", \"updatedAt\`) VALUES ('\${values[0]}', '\${values[1]}', '\${values[2]}', '\${values[3]}', '\${values[4]}', \${values[5]}, \${values[6]}, '\${values[7]}', \${values[8] ? \"'\" + values[8] + \"'\" : 'NULL'}, \${values[9] ? \"'\" + values[9] + \"'\" : 'NULL'}, \${values[10] ? \"'\" + values[10] + \"'\" : 'NULL'}, '\${values[11]}', '\${values[12]}');\`);
    });
    console.log('');
}

// Import registrations
if (data.registrations && data.registrations.length > 0) {
    console.log('-- Importing registrations');
    data.registrations.forEach(registration => {
        const values = [
            registration.id,
            registration.tournamentId,
            registration.playerName,
            registration.playerEmail,
            registration.playerPhone,
            registration.playerAge,
            registration.playerGender,
            registration.playerCategory,
            registration.paymentStatus,
            new Date(registration.registeredAt).toISOString()
        ];
        console.log(\`INSERT INTO registrations (id, \"tournamentId\", \"playerName\", \"playerEmail\", \"playerPhone\", \"playerAge\", \"playerGender\", \"playerCategory\", \"paymentStatus\", \"registeredAt\`) VALUES ('\${values[0]}', '\${values[1]}', '\${values[2]}', '\${values[3]}', '\${values[4]}', \${values[5]}, '\${values[6]}', '\${values[7]}', '\${values[8]}', '\${values[9]}');\`);
    });
    console.log('');
}

// Import judges
if (data.judges && data.judges.length > 0) {
    console.log('-- Importing judges');
    data.judges.forEach(judge => {
        const values = [
            judge.id,
            judge.organizerId,
            judge.fullName,
            judge.gender,
            JSON.stringify(judge.categories),
            judge.phone,
            judge.email,
            judge.bio,
            new Date(judge.createdAt).toISOString(),
            new Date(judge.updatedAt).toISOString()
        ];
        console.log(\`INSERT INTO judges (id, \"organizerId\", \"fullName\", gender, categories, phone, email, bio, \"createdAt\", \"updatedAt\`) VALUES ('\${values[0]}', '\${values[1]}', '\${values[2]}', '\${values[3]}', '\${values[4]}', \${values[5] ? \"'\" + values[5] + \"'\" : 'NULL'}, \${values[6] ? \"'\" + values[6] + \"'\" : 'NULL'}, \${values[7] ? \"'\" + values[7] + \"'\" : 'NULL'}, '\${values[8]}', '\${values[9]}');\`);
    });
    console.log('');
}

// Import payments
if (data.payments && data.payments.length > 0) {
    console.log('-- Importing payments');
    data.payments.forEach(payment => {
        const values = [
            payment.id,
            payment.organizerId,
            payment.tournamentId,
            payment.amount,
            payment.currency,
            payment.type,
            payment.status,
            payment.gatewayRef,
            payment.stripeSessionId,
            payment.stripePaymentIntentId,
            new Date(payment.createdAt).toISOString(),
            new Date(payment.updatedAt).toISOString()
        ];
        console.log(\`INSERT INTO payments (id, \"organizerId\", \"tournamentId\", amount, currency, type, status, \"gatewayRef\", \"stripeSessionId\", \"stripePaymentIntentId\", \"createdAt\", \"updatedAt\`) VALUES ('\${values[0]}', '\${values[1]}', \${values[2] ? \"'\" + values[2] + \"'\" : 'NULL'}, \${values[3]}, '\${values[4]}', '\${values[5]}', '\${values[6]}', \${values[7] ? \"'\" + values[7] + \"'\" : 'NULL'}, \${values[8] ? \"'\" + values[8] + \"'\" : 'NULL'}, \${values[9] ? \"'\" + values[9] + \"'\" : 'NULL'}, '\${values[10]}', '\${values[11]}');\`);
    });
    console.log('');
}

// Import audit logs
if (data.auditLogs && data.auditLogs.length > 0) {
    console.log('-- Importing audit logs');
    data.auditLogs.forEach(auditLog => {
        const values = [
            auditLog.id,
            auditLog.actorUserId,
            auditLog.organizerId,
            auditLog.action,
            auditLog.entityType,
            auditLog.entityId,
            auditLog.tournamentId,
            auditLog.paymentId,
            auditLog.meta ? JSON.stringify(auditLog.meta) : null,
            new Date(auditLog.createdAt).toISOString()
        ];
        console.log(\`INSERT INTO audit_logs (id, \"actorUserId\", \"organizerId\", action, \"entityType\", \"entityId\", \"tournamentId\", \"paymentId\", meta, \"createdAt\`) VALUES ('\${values[0]}', \${values[1] ? \"'\" + values[1] + \"'\" : 'NULL'}, \${values[2] ? \"'\" + values[2] + \"'\" : 'NULL'}, '\${values[3]}', '\${values[4]}', \${values[5] ? \"'\" + values[5] + \"'\" : 'NULL'}, \${values[6] ? \"'\" + values[6] + \"'\" : 'NULL'}, \${values[7] ? \"'\" + values[7] + \"'\" : 'NULL'}, \${values[8] ? \"'\" + values[8] + \"'\" : 'NULL'}, '\${values[9]}');\`);
    });
    console.log('');
}

console.log('-- Import completed');
" > $TEMP_SQL

# Execute the import
echo "📥 Executing import to production database..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $TEMP_SQL

# Clean up temporary file
rm $TEMP_SQL

if [ $? -eq 0 ]; then
    echo "✅ Data import completed successfully"
else
    echo "❌ Data import failed"
    exit 1
fi

# Show final counts
echo "📊 Final production data counts:"
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
SELECT 'Users', COUNT(*) FROM users 
UNION ALL 
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;
"

echo "✅ Clean data import to production completed!"
echo "📁 Pre-import backup: $BACKUP_FILE"
echo "🎯 Production database now has clean data from local development"
