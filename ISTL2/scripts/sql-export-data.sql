-- =====================================================
-- Data Export Script for PostgreSQL
-- =====================================================
-- This script exports all data from your database as INSERT statements
-- Run this to create SQL files that can be imported to another database

-- =====================================================
-- 1. EXPORT USERS
-- =====================================================
-- Copy this output to a file: export_users.sql

SELECT 'INSERT INTO users (id, email, name, "passwordHash", role, status, "emailVerified", "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || email || ''', ' ||
    '''' || REPLACE(name, '''', '''''') || ''', ' ||
    CASE WHEN "passwordHash" IS NULL THEN 'NULL' ELSE '''' || "passwordHash" || '''' END || ', ' ||
    '''' || role || ''', ' ||
    '''' || status || ''', ' ||
    CASE WHEN "emailVerified" IS NULL THEN 'NULL' ELSE '''' || "emailVerified" || '''' END || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM users
ORDER BY "createdAt";

-- =====================================================
-- 2. EXPORT ORGANIZERS
-- =====================================================
-- Copy this output to a file: export_organizers.sql

SELECT 'INSERT INTO organizers (id, name, slug, status, "ownerUserId", contact, "oneTimeFeePaidAt", "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || REPLACE(name, '''', '''''') || ''', ' ||
    '''' || slug || ''', ' ||
    '''' || status || ''', ' ||
    '''' || "ownerUserId" || ''', ' ||
    '''' || REPLACE(contact::text, '''', '''''') || ''', ' ||
    CASE WHEN "oneTimeFeePaidAt" IS NULL THEN 'NULL' ELSE '''' || "oneTimeFeePaidAt" || '''' END || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM organizers
ORDER BY "createdAt";

-- =====================================================
-- 3. EXPORT VENUES
-- =====================================================
-- Copy this output to a file: export_venues.sql

SELECT 'INSERT INTO venues (id, "organizerId", name, locality, city, state, pincode, address, "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || "organizerId" || ''', ' ||
    '''' || REPLACE(name, '''', '''''') || ''', ' ||
    '''' || REPLACE(locality, '''', '''''') || ''', ' ||
    '''' || REPLACE(city, '''', '''''') || ''', ' ||
    '''' || REPLACE(state, '''', '''''') || ''', ' ||
    '''' || pincode || ''', ' ||
    '''' || REPLACE(address, '''', '''''') || ''', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM venues
ORDER BY "createdAt";

-- =====================================================
-- 4. EXPORT TOURNAMENTS
-- =====================================================
-- Copy this output to a file: export_tournaments.sql

SELECT 'INSERT INTO tournaments (id, "organizerId", title, sport, date, "entryFee", "maxParticipants", status, "venueId", "currentRound", "progressionData", "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || "organizerId" || ''', ' ||
    '''' || REPLACE(title, '''', '''''') || ''', ' ||
    '''' || REPLACE(sport, '''', '''''') || ''', ' ||
    '''' || date || ''', ' ||
    entryFee || ', ' ||
    "maxParticipants" || ', ' ||
    '''' || status || ''', ' ||
    CASE WHEN "venueId" IS NULL THEN 'NULL' ELSE '''' || "venueId" || '''' END || ', ' ||
    CASE WHEN "currentRound" IS NULL THEN 'NULL' ELSE '''' || REPLACE("currentRound", '''', '''''') || '''' END || ', ' ||
    CASE WHEN "progressionData" IS NULL THEN 'NULL' ELSE '''' || REPLACE("progressionData"::text, '''', '''''') || '''' END || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM tournaments
ORDER BY "createdAt";

-- =====================================================
-- 5. EXPORT REGISTRATIONS
-- =====================================================
-- Copy this output to a file: export_registrations.sql

SELECT 'INSERT INTO registrations (id, "tournamentId", "playerName", "playerEmail", "playerPhone", "playerAge", "playerGender", "playerCategory", "paymentStatus", "registeredAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || "tournamentId" || ''', ' ||
    '''' || REPLACE("playerName", '''', '''''') || ''', ' ||
    '''' || "playerEmail" || ''', ' ||
    '''' || "playerPhone" || ''', ' ||
    "playerAge" || ', ' ||
    '''' || "playerGender" || ''', ' ||
    '''' || REPLACE("playerCategory", '''', '''''') || ''', ' ||
    '''' || "paymentStatus" || ''', ' ||
    '''' || "registeredAt" || ''');'
FROM registrations
ORDER BY "registeredAt";

-- =====================================================
-- 6. EXPORT JUDGES
-- =====================================================
-- Copy this output to a file: export_judges.sql

SELECT 'INSERT INTO judges (id, "organizerId", "fullName", gender, categories, phone, email, bio, "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || "organizerId" || ''', ' ||
    '''' || REPLACE("fullName", '''', '''''') || ''', ' ||
    '''' || gender || ''', ' ||
    '''' || REPLACE(categories::text, '''', '''''') || ''', ' ||
    CASE WHEN phone IS NULL THEN 'NULL' ELSE '''' || phone || '''' END || ', ' ||
    CASE WHEN email IS NULL THEN 'NULL' ELSE '''' || email || '''' END || ', ' ||
    CASE WHEN bio IS NULL THEN 'NULL' ELSE '''' || REPLACE(bio, '''', '''''') || '''' END || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM judges
ORDER BY "createdAt";

-- =====================================================
-- 7. EXPORT PAYMENTS
-- =====================================================
-- Copy this output to a file: export_payments.sql

SELECT 'INSERT INTO payments (id, "organizerId", "tournamentId", amount, currency, type, status, "gatewayRef", "stripeSessionId", "stripePaymentIntentId", "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || "organizerId" || ''', ' ||
    CASE WHEN "tournamentId" IS NULL THEN 'NULL' ELSE '''' || "tournamentId" || '''' END || ', ' ||
    amount || ', ' ||
    '''' || currency || ''', ' ||
    '''' || type || ''', ' ||
    '''' || status || ''', ' ||
    CASE WHEN "gatewayRef" IS NULL THEN 'NULL' ELSE '''' || "gatewayRef" || '''' END || ', ' ||
    CASE WHEN "stripeSessionId" IS NULL THEN 'NULL' ELSE '''' || "stripeSessionId" || '''' END || ', ' ||
    CASE WHEN "stripePaymentIntentId" IS NULL THEN 'NULL' ELSE '''' || "stripePaymentIntentId" || '''' END || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM payments
ORDER BY "createdAt";

-- =====================================================
-- 8. EXPORT AUDIT LOGS
-- =====================================================
-- Copy this output to a file: export_audit_logs.sql

SELECT 'INSERT INTO audit_logs (id, "actorUserId", "organizerId", action, "entityType", "entityId", "tournamentId", "paymentId", meta, "createdAt") VALUES (' ||
    '''' || id || ''', ' ||
    CASE WHEN "actorUserId" IS NULL THEN 'NULL' ELSE '''' || "actorUserId" || '''' END || ', ' ||
    CASE WHEN "organizerId" IS NULL THEN 'NULL' ELSE '''' || "organizerId" || '''' END || ', ' ||
    '''' || REPLACE(action, '''', '''''') || ''', ' ||
    '''' || REPLACE("entityType", '''', '''''') || ''', ' ||
    CASE WHEN "entityId" IS NULL THEN 'NULL' ELSE '''' || "entityId" || '''' END || ', ' ||
    CASE WHEN "tournamentId" IS NULL THEN 'NULL' ELSE '''' || "tournamentId" || '''' END || ', ' ||
    CASE WHEN "paymentId" IS NULL THEN 'NULL' ELSE '''' || "paymentId" || '''' END || ', ' ||
    CASE WHEN meta IS NULL THEN 'NULL' ELSE '''' || REPLACE(meta::text, '''', '''''') || '''' END || ', ' ||
    '''' || "createdAt" || ''');'
FROM audit_logs
ORDER BY "createdAt";

-- =====================================================
-- 9. EXPORT SUMMARY
-- =====================================================
-- Run this to get a summary of what will be exported

SELECT 
    'Users' as table_name, 
    COUNT(*) as count 
FROM users 
UNION ALL 
SELECT 'Organizers', COUNT(*) FROM organizers 
UNION ALL 
SELECT 'Venues', COUNT(*) FROM venues 
UNION ALL 
SELECT 'Tournaments', COUNT(*) FROM tournaments 
UNION ALL 
SELECT 'Registrations', COUNT(*) FROM registrations 
UNION ALL 
SELECT 'Judges', COUNT(*) FROM judges 
UNION ALL 
SELECT 'Payments', COUNT(*) FROM payments 
UNION ALL 
SELECT 'Audit Logs', COUNT(*) FROM audit_logs
ORDER BY table_name;

-- =====================================================
-- 10. USAGE INSTRUCTIONS
-- =====================================================
-- 1. Run each export query above
-- 2. Copy the output to separate .sql files
-- 3. Combine all files into one master export file
-- 4. Import to target database using: psql -f export_file.sql

-- Alternative: Use pg_dump for easier export
-- pg_dump -h hostname -p port -U username -d database_name --data-only --inserts > export_data.sql
