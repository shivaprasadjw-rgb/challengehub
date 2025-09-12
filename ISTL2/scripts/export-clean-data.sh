#!/bin/bash

# Data Export Script for Local Database
# This script exports clean data from your local database for import to production

echo "📤 Starting Local Data Export..."

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

echo "📊 Exporting from local database: ${DATABASE_URL}"

# Extract connection details from DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
DB_USER=$(echo $DB_URL | cut -d':' -f1)
DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2)

# Create exports directory
mkdir -p exports

# Generate export filename with timestamp
EXPORT_FILE="exports/clean-data-$(date +%Y%m%d-%H%M%S).json"

echo "📝 Exporting data to: $EXPORT_FILE"

# Create a temporary SQL file for data export
TEMP_SQL="temp_export.sql"

cat > $TEMP_SQL << 'EOF'
-- Export all data as JSON
\copy (
    SELECT json_agg(
        json_build_object(
            'tournaments', (SELECT json_agg(row_to_json(t)) FROM tournaments t),
            'organizers', (SELECT json_agg(row_to_json(o)) FROM organizers o),
            'venues', (SELECT json_agg(row_to_json(v)) FROM venues v),
            'registrations', (SELECT json_agg(row_to_json(r)) FROM registrations r),
            'judges', (SELECT json_agg(row_to_json(j)) FROM judges j),
            'payments', (SELECT json_agg(row_to_json(p)) FROM payments p),
            'users', (SELECT json_agg(row_to_json(u)) FROM users u),
            'auditLogs', (SELECT json_agg(row_to_json(a)) FROM audit_logs a),
            'exportedAt', now()
        )
    )
    FROM (SELECT 1) as dummy
) TO STDOUT WITH (FORMAT text);
EOF

# Execute the export
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $TEMP_SQL > $EXPORT_FILE

# Clean up temporary file
rm $TEMP_SQL

if [ $? -eq 0 ]; then
    echo "✅ Data export completed successfully"
else
    echo "❌ Data export failed"
    exit 1
fi

# Show export summary
echo "📊 Export summary:"
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

# Show file size
FILE_SIZE=$(du -h "$EXPORT_FILE" | cut -f1)
echo "📁 Export file: $EXPORT_FILE"
echo "📏 File size: $FILE_SIZE"

echo "✅ Local data export completed!"
echo "🎯 You can now import this data to production using: ./scripts/import-clean-data.sh"
