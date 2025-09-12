-- =====================================================
-- Database Cleanup Scripts for PostgreSQL
-- =====================================================
-- These SQL scripts clean duplicate data from your database
-- Run these scripts in your PostgreSQL client (pgAdmin, DBeaver, psql, etc.)

-- =====================================================
-- 1. BACKUP CREATION
-- =====================================================
-- Before running any cleanup, create a backup
-- Run this command in terminal:
-- pg_dump -h hostname -p port -U username -d database_name > backup_YYYYMMDD_HHMMSS.sql

-- =====================================================
-- 2. CHECK CURRENT DATA COUNTS
-- =====================================================
-- Run this to see current data counts before cleanup

SELECT 
    'Tournaments' as table_name, 
    COUNT(*) as count 
FROM tournaments 
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
SELECT 'Audit Logs', COUNT(*) FROM audit_logs
ORDER BY table_name;

-- =====================================================
-- 3. FIND DUPLICATE RECORDS
-- =====================================================
-- Run these queries to identify duplicates before cleaning

-- Find duplicate tournaments (by title and date)
SELECT 
    title, 
    date, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM tournaments 
GROUP BY title, date 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate organizers (by name)
SELECT 
    name, 
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM organizers 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate venues (by name and organizer)
SELECT 
    name, 
    "organizerId",
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM venues 
GROUP BY name, "organizerId"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate registrations (by email and tournament)
SELECT 
    "playerEmail", 
    "tournamentId",
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM registrations 
GROUP BY "playerEmail", "tournamentId"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate judges (by name and organizer)
SELECT 
    "fullName", 
    "organizerId",
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM judges 
GROUP BY "fullName", "organizerId"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate payments (by organizer, tournament, and amount)
SELECT 
    "organizerId", 
    "tournamentId",
    amount,
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ') as duplicate_ids
FROM payments 
GROUP BY "organizerId", "tournamentId", amount
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- =====================================================
-- 4. CLEAN DUPLICATE RECORDS
-- =====================================================
-- Run these scripts to remove duplicates (keeping the oldest record)

-- Clean duplicate tournaments
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY title, date 
            ORDER BY "createdAt" ASC
        ) as rn
    FROM tournaments
)
DELETE FROM tournaments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean duplicate organizers
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY name 
            ORDER BY "createdAt" ASC
        ) as rn
    FROM organizers
)
DELETE FROM organizers 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean duplicate venues
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY name, "organizerId" 
            ORDER BY "createdAt" ASC
        ) as rn
    FROM venues
)
DELETE FROM venues 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean duplicate registrations
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY "playerEmail", "tournamentId" 
            ORDER BY "registeredAt" ASC
        ) as rn
    FROM registrations
)
DELETE FROM registrations 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean duplicate judges
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY "fullName", "organizerId" 
            ORDER BY "createdAt" ASC
        ) as rn
    FROM judges
)
DELETE FROM judges 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean duplicate payments
WITH duplicates AS (
    SELECT 
        id, 
        ROW_NUMBER() OVER (
            PARTITION BY "organizerId", "tournamentId", amount 
            ORDER BY "createdAt" ASC
        ) as rn
    FROM payments
)
DELETE FROM payments 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- =====================================================
-- 5. CLEAN ORPHANED RECORDS
-- =====================================================
-- Remove records that reference non-existent parent records

-- Remove registrations for non-existent tournaments
DELETE FROM registrations 
WHERE "tournamentId" NOT IN (SELECT id FROM tournaments);

-- Remove tournaments for non-existent organizers
DELETE FROM tournaments 
WHERE "organizerId" NOT IN (SELECT id FROM organizers);

-- Remove venues for non-existent organizers
DELETE FROM venues 
WHERE "organizerId" NOT IN (SELECT id FROM organizers);

-- Remove judges for non-existent organizers
DELETE FROM judges 
WHERE "organizerId" NOT IN (SELECT id FROM organizers);

-- Remove payments for non-existent organizers
DELETE FROM payments 
WHERE "organizerId" NOT IN (SELECT id FROM organizers);

-- Remove payments for non-existent tournaments
DELETE FROM payments 
WHERE "tournamentId" IS NOT NULL 
AND "tournamentId" NOT IN (SELECT id FROM tournaments);

-- Remove audit logs for non-existent entities
DELETE FROM audit_logs 
WHERE "tournamentId" IS NOT NULL 
AND "tournamentId" NOT IN (SELECT id FROM tournaments);

DELETE FROM audit_logs 
WHERE "organizerId" IS NOT NULL 
AND "organizerId" NOT IN (SELECT id FROM organizers);

DELETE FROM audit_logs 
WHERE "paymentId" IS NOT NULL 
AND "paymentId" NOT IN (SELECT id FROM payments);

-- =====================================================
-- 6. VERIFY CLEANUP RESULTS
-- =====================================================
-- Run this to see final data counts after cleanup

SELECT 
    'Tournaments' as table_name, 
    COUNT(*) as count 
FROM tournaments 
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
SELECT 'Audit Logs', COUNT(*) FROM audit_logs
ORDER BY table_name;

-- =====================================================
-- 7. DATA INTEGRITY CHECKS
-- =====================================================
-- Run these to verify data integrity after cleanup

-- Check for remaining duplicates
SELECT 'Remaining Tournament Duplicates' as check_type, COUNT(*) as count
FROM (
    SELECT title, date, COUNT(*) 
    FROM tournaments 
    GROUP BY title, date 
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Remaining Organizer Duplicates', COUNT(*)
FROM (
    SELECT name, COUNT(*) 
    FROM organizers 
    GROUP BY name 
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Remaining Venue Duplicates', COUNT(*)
FROM (
    SELECT name, "organizerId", COUNT(*) 
    FROM venues 
    GROUP BY name, "organizerId"
    HAVING COUNT(*) > 1
) as duplicates

UNION ALL

SELECT 'Remaining Registration Duplicates', COUNT(*)
FROM (
    SELECT "playerEmail", "tournamentId", COUNT(*) 
    FROM registrations 
    GROUP BY "playerEmail", "tournamentId"
    HAVING COUNT(*) > 1
) as duplicates;

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
