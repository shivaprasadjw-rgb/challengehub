-- =====================================================
-- Complete Database Reset Script for PostgreSQL
-- =====================================================
-- This script completely resets your database
-- ⚠️ WARNING: This will DELETE ALL DATA
-- ⚠️ Make sure you have a backup before running this!

-- =====================================================
-- 1. CREATE BACKUP FIRST
-- =====================================================
-- Run this command in terminal before proceeding:
-- pg_dump -h hostname -p port -U username -d database_name > full_backup_YYYYMMDD_HHMMSS.sql

-- =====================================================
-- 2. CHECK CURRENT DATA COUNTS
-- =====================================================
-- Run this to see what will be deleted

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
-- 3. DISABLE FOREIGN KEY CHECKS (if needed)
-- =====================================================
-- Some PostgreSQL versions may need this
-- SET session_replication_role = replica;

-- =====================================================
-- 4. DELETE ALL DATA (EXCEPT USERS)
-- =====================================================
-- Delete in order to respect foreign key constraints

-- Delete registrations first (they reference tournaments)
DELETE FROM registrations;

-- Delete tournaments (they reference organizers and venues)
DELETE FROM tournaments;

-- Delete venues (they reference organizers)
DELETE FROM venues;

-- Delete judges (they reference organizers)
DELETE FROM judges;

-- Delete payments (they reference organizers and tournaments)
DELETE FROM payments;

-- Delete audit logs (they reference various entities)
DELETE FROM audit_logs;

-- Delete organizer applications
DELETE FROM organizer_applications;

-- Delete user-organizer relationships
DELETE FROM user_organizers;

-- Keep users for authentication (comment out if you want to delete users too)
-- DELETE FROM users;

-- =====================================================
-- 5. RESET SEQUENCES (if using serial/identity columns)
-- =====================================================
-- Uncomment these if you're using serial/identity columns

-- ALTER SEQUENCE tournaments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE organizers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE venues_id_seq RESTART WITH 1;
-- ALTER SEQUENCE registrations_id_seq RESTART WITH 1;
-- ALTER SEQUENCE judges_id_seq RESTART WITH 1;
-- ALTER SEQUENCE payments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;

-- =====================================================
-- 6. VERIFY RESET
-- =====================================================
-- Run this to confirm all data is deleted

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
-- 7. RE-ENABLE FOREIGN KEY CHECKS
-- =====================================================
-- SET session_replication_role = DEFAULT;

-- =====================================================
-- 8. NEXT STEPS
-- =====================================================
-- After running this script:
-- 1. Run your Prisma seed script: npm run db:seed
-- 2. Or import clean data from your export files
-- 3. Test your application to ensure everything works

-- =====================================================
-- 9. ALTERNATIVE: DROP AND RECREATE TABLES
-- =====================================================
-- If you want to completely recreate the schema, uncomment this section:

/*
-- Drop all tables (this will delete the schema too)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS judges CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS organizer_applications CASCADE;
DROP TABLE IF EXISTS user_organizers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS "TournamentStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "OrganizerStatus" CASCADE;
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "MembershipRole" CASCADE;
DROP TYPE IF EXISTS "Gender" CASCADE;
DROP TYPE IF EXISTS "PaymentType" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "MatchStatus" CASCADE;

-- After dropping, run: npx prisma db push
-- This will recreate all tables and enum types
*/
