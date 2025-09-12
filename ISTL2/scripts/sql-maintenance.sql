-- =====================================================
-- Database Maintenance Scripts for PostgreSQL
-- =====================================================
-- Collection of useful SQL scripts for database maintenance
-- Run these scripts in your PostgreSQL client (pgAdmin, DBeaver, psql, etc.)

-- =====================================================
-- 1. DATABASE HEALTH CHECK
-- =====================================================
-- Run this to get an overview of your database health

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
    'Tournaments' as table_name, 
    COUNT(*) as row_count,
    pg_size_pretty(pg_total_relation_size('tournaments')) as table_size
FROM tournaments 
UNION ALL 
SELECT 'Organizers', COUNT(*), pg_size_pretty(pg_total_relation_size('organizers'))
FROM organizers 
UNION ALL 
SELECT 'Venues', COUNT(*), pg_size_pretty(pg_total_relation_size('venues'))
FROM venues 
UNION ALL 
SELECT 'Registrations', COUNT(*), pg_size_pretty(pg_total_relation_size('registrations'))
FROM registrations 
UNION ALL 
SELECT 'Judges', COUNT(*), pg_size_pretty(pg_total_relation_size('judges'))
FROM judges 
UNION ALL 
SELECT 'Payments', COUNT(*), pg_size_pretty(pg_total_relation_size('payments'))
FROM payments 
UNION ALL 
SELECT 'Users', COUNT(*), pg_size_pretty(pg_total_relation_size('users'))
FROM users 
UNION ALL 
SELECT 'Audit Logs', COUNT(*), pg_size_pretty(pg_total_relation_size('audit_logs'))
FROM audit_logs
ORDER BY row_count DESC;

-- =====================================================
-- 2. FIND LARGE TABLES AND INDEXES
-- =====================================================
-- Identify tables that might need optimization

-- Largest tables
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
    pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- =====================================================
-- 3. PERFORMANCE ANALYSIS
-- =====================================================
-- Identify slow queries and performance issues

-- Most frequently executed queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY calls DESC 
LIMIT 10;

-- Slowest queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- =====================================================
-- 4. DATA QUALITY CHECKS
-- =====================================================
-- Check for data quality issues

-- Check for NULL values in critical fields
SELECT 
    'Tournaments without organizer' as issue,
    COUNT(*) as count
FROM tournaments 
WHERE "organizerId" IS NULL

UNION ALL

SELECT 'Registrations without tournament', COUNT(*)
FROM registrations 
WHERE "tournamentId" IS NULL

UNION ALL

SELECT 'Venues without organizer', COUNT(*)
FROM venues 
WHERE "organizerId" IS NULL

UNION ALL

SELECT 'Judges without organizer', COUNT(*)
FROM judges 
WHERE "organizerId" IS NULL

UNION ALL

SELECT 'Payments without organizer', COUNT(*)
FROM payments 
WHERE "organizerId" IS NULL;

-- Check for invalid enum values
SELECT 
    'Invalid tournament status' as issue,
    COUNT(*) as count
FROM tournaments 
WHERE status NOT IN ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED')

UNION ALL

SELECT 'Invalid user role', COUNT(*)
FROM users 
WHERE role NOT IN ('SUPER_ADMIN', 'ORG_USER', 'JUDGE', 'PLAYER')

UNION ALL

SELECT 'Invalid payment status', COUNT(*)
FROM payments 
WHERE status NOT IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- =====================================================
-- 5. CLEANUP OLD DATA
-- =====================================================
-- Scripts to clean up old or unnecessary data

-- Delete old audit logs (older than 1 year)
-- Uncomment and modify date as needed
/*
DELETE FROM audit_logs 
WHERE "createdAt" < NOW() - INTERVAL '1 year';
*/

-- Delete completed tournaments older than 6 months
-- Uncomment and modify date as needed
/*
DELETE FROM tournaments 
WHERE status = 'COMPLETED' 
AND "createdAt" < NOW() - INTERVAL '6 months';
*/

-- Delete old failed payments (older than 30 days)
-- Uncomment and modify date as needed
/*
DELETE FROM payments 
WHERE status = 'FAILED' 
AND "createdAt" < NOW() - INTERVAL '30 days';
*/

-- =====================================================
-- 6. OPTIMIZATION SCRIPTS
-- =====================================================
-- Scripts to optimize database performance

-- Update table statistics
ANALYZE;

-- Reindex all tables (run during maintenance window)
-- Uncomment if needed
/*
REINDEX DATABASE your_database_name;
*/

-- Vacuum tables to reclaim space
VACUUM ANALYZE;

-- =====================================================
-- 7. BACKUP VERIFICATION
-- =====================================================
-- Scripts to verify backup integrity

-- Check for recent data
SELECT 
    'Recent Tournaments' as check_type,
    COUNT(*) as count
FROM tournaments 
WHERE "createdAt" > NOW() - INTERVAL '7 days'

UNION ALL

SELECT 'Recent Registrations', COUNT(*)
FROM registrations 
WHERE "registeredAt" > NOW() - INTERVAL '7 days'

UNION ALL

SELECT 'Recent Payments', COUNT(*)
FROM payments 
WHERE "createdAt" > NOW() - INTERVAL '7 days';

-- Check for data consistency
SELECT 
    'Tournaments with registrations' as check_type,
    COUNT(*) as count
FROM tournaments t
WHERE EXISTS (SELECT 1 FROM registrations r WHERE r."tournamentId" = t.id)

UNION ALL

SELECT 'Organizers with tournaments', COUNT(*)
FROM organizers o
WHERE EXISTS (SELECT 1 FROM tournaments t WHERE t."organizerId" = o.id)

UNION ALL

SELECT 'Venues with tournaments', COUNT(*)
FROM venues v
WHERE EXISTS (SELECT 1 FROM tournaments t WHERE t."venueId" = v.id);

-- =====================================================
-- 8. SECURITY CHECKS
-- =====================================================
-- Scripts to check for security issues

-- Check for users without email verification
SELECT 
    'Unverified Users' as issue,
    COUNT(*) as count
FROM users 
WHERE "emailVerified" IS NULL;

-- Check for users with weak passwords (if you can identify them)
-- This is just an example - modify based on your password requirements
SELECT 
    'Users with NULL password hash' as issue,
    COUNT(*) as count
FROM users 
WHERE "passwordHash" IS NULL;

-- =====================================================
-- 9. MONITORING QUERIES
-- =====================================================
-- Queries to run regularly for monitoring

-- Active tournaments count
SELECT 
    status,
    COUNT(*) as count
FROM tournaments 
GROUP BY status
ORDER BY count DESC;

-- Registration trends (last 30 days)
SELECT 
    DATE("registeredAt") as date,
    COUNT(*) as registrations
FROM registrations 
WHERE "registeredAt" > NOW() - INTERVAL '30 days'
GROUP BY DATE("registeredAt")
ORDER BY date DESC;

-- Payment status distribution
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM payments 
GROUP BY status
ORDER BY count DESC;

-- =====================================================
-- 10. EMERGENCY PROCEDURES
-- =====================================================
-- Scripts for emergency situations

-- Quick database size check
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- Check for locks
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    state,
    query
FROM pg_stat_activity 
WHERE state = 'active';

-- Kill specific query (use with caution)
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 'your_pid_here';

-- =====================================================
-- USAGE NOTES
-- =====================================================
-- 1. Run these scripts regularly (weekly/monthly)
-- 2. Monitor the results and set up alerts
-- 3. Adjust intervals based on your data volume
-- 4. Always backup before running cleanup scripts
-- 5. Test scripts on development environment first
