-- =====================================================
-- Data Import Script for PostgreSQL
-- =====================================================
-- This script imports data from export files
-- Make sure the target database is empty or you want to add to existing data

-- =====================================================
-- 1. PRE-IMPORT CHECKS
-- =====================================================
-- Run this to check current data counts before import

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
-- 2. CLEAR EXISTING DATA (OPTIONAL)
-- =====================================================
-- Uncomment this section if you want to clear existing data before import

/*
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
-- DELETE FROM users;
-- DELETE FROM organizers;
*/

-- =====================================================
-- 3. IMPORT DATA IN CORRECT ORDER
-- =====================================================
-- Import data in this order to respect foreign key constraints

-- 3.1 Import Users (if not keeping existing users)
-- Paste your export_users.sql content here
-- Example:
-- INSERT INTO users (id, email, name, "passwordHash", role, status, "emailVerified", "createdAt", "updatedAt") VALUES (...);

-- 3.2 Import Organizers
-- Paste your export_organizers.sql content here
-- Example:
-- INSERT INTO organizers (id, name, slug, status, "ownerUserId", contact, "oneTimeFeePaidAt", "createdAt", "updatedAt") VALUES (...);

-- 3.3 Import Venues
-- Paste your export_venues.sql content here
-- Example:
-- INSERT INTO venues (id, "organizerId", name, locality, city, state, pincode, address, "createdAt", "updatedAt") VALUES (...);

-- 3.4 Import Tournaments
-- Paste your export_tournaments.sql content here
-- Example:
-- INSERT INTO tournaments (id, "organizerId", title, sport, date, "entryFee", "maxParticipants", status, "venueId", "currentRound", "progressionData", "createdAt", "updatedAt") VALUES (...);

-- 3.5 Import Judges
-- Paste your export_judges.sql content here
-- Example:
-- INSERT INTO judges (id, "organizerId", "fullName", gender, categories, phone, email, bio, "createdAt", "updatedAt") VALUES (...);

-- 3.6 Import Payments
-- Paste your export_payments.sql content here
-- Example:
-- INSERT INTO payments (id, "organizerId", "tournamentId", amount, currency, type, status, "gatewayRef", "stripeSessionId", "stripePaymentIntentId", "createdAt", "updatedAt") VALUES (...);

-- 3.7 Import Registrations
-- Paste your export_registrations.sql content here
-- Example:
-- INSERT INTO registrations (id, "tournamentId", "playerName", "playerEmail", "playerPhone", "playerAge", "playerGender", "playerCategory", "paymentStatus", "registeredAt") VALUES (...);

-- 3.8 Import Audit Logs
-- Paste your export_audit_logs.sql content here
-- Example:
-- INSERT INTO audit_logs (id, "actorUserId", "organizerId", action, "entityType", "entityId", "tournamentId", "paymentId", meta, "createdAt") VALUES (...);

-- =====================================================
-- 4. POST-IMPORT VERIFICATION
-- =====================================================
-- Run this to verify the import was successful

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
-- 5. DATA INTEGRITY CHECKS
-- =====================================================
-- Run these to verify data integrity after import

-- Check for orphaned records
SELECT 'Orphaned Registrations' as check_type, COUNT(*) as count
FROM registrations r
LEFT JOIN tournaments t ON r."tournamentId" = t.id
WHERE t.id IS NULL

UNION ALL

SELECT 'Orphaned Tournaments', COUNT(*)
FROM tournaments t
LEFT JOIN organizers o ON t."organizerId" = o.id
WHERE o.id IS NULL

UNION ALL

SELECT 'Orphaned Venues', COUNT(*)
FROM venues v
LEFT JOIN organizers o ON v."organizerId" = o.id
WHERE o.id IS NULL

UNION ALL

SELECT 'Orphaned Judges', COUNT(*)
FROM judges j
LEFT JOIN organizers o ON j."organizerId" = o.id
WHERE o.id IS NULL

UNION ALL

SELECT 'Orphaned Payments', COUNT(*)
FROM payments p
LEFT JOIN organizers o ON p."organizerId" = o.id
WHERE o.id IS NULL;

-- Check for duplicate records
SELECT 'Duplicate Tournaments' as check_type, COUNT(*) as count
FROM (
    SELECT title, date, COUNT(*) 
    FROM tournaments 
    GROUP BY title, date 
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Duplicate Organizers', COUNT(*)
FROM (
    SELECT name, COUNT(*) 
    FROM organizers 
    GROUP BY name 
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Duplicate Venues', COUNT(*)
FROM (
    SELECT name, "organizerId", COUNT(*) 
    FROM venues 
    GROUP BY name, "organizerId"
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Duplicate Registrations', COUNT(*)
FROM (
    SELECT "playerEmail", "tournamentId", COUNT(*) 
    FROM registrations 
    GROUP BY "playerEmail", "tournamentId"
    HAVING COUNT(*) > 1
) as duplicates;

-- =====================================================
-- 6. USAGE INSTRUCTIONS
-- =====================================================
-- 1. Run the export script on source database
-- 2. Copy the generated INSERT statements to this file
-- 3. Run this script on target database
-- 4. Verify the import was successful
-- 5. Test your application

-- Alternative: Use pg_dump and pg_restore for easier import
-- pg_dump -h source_host -p source_port -U source_user -d source_db --data-only --inserts > export_data.sql
-- psql -h target_host -p target_port -U target_user -d target_db -f export_data.sql
