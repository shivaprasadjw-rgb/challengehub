# Issue Log + Fixes Documentation

This document tracks all issues encountered during development and their solutions to prevent re-solving the same problems.

## 📋 Quick Reference Table

| Date | Issue | Fix Summary | Files Affected | Cursor Prompt Used | Status |
|------|-------|-------------|----------------|-------------------|---------|
| 2025-01-12 | PostgreSQL Enum Type Error | Complete table recreation with proper enum types | `prisma/schema.prisma`, `app/api/tournaments/route.ts`, `app/api/test-enums/route.ts` | "we are in the right project directory: Please go through the below error and resolve it" | ✅ Resolved |

---

## 📝 Detailed Issue Log

### Issue #001: PostgreSQL Enum Type Error
**Date:** January 12, 2025  
**Status:** ✅ Resolved

#### Problem Description
```
Error: operator does not exist: text = "TournamentStatus"
PostgreSQL error code: 42883
```

The deployment was failing because:
- Prisma schema defined enum types (TournamentStatus, UserRole, etc.)
- PostgreSQL database didn't have these enum types created
- Existing data was stored as text but Prisma expected enum types
- This caused query failures during static page generation

#### Root Cause
- Database schema mismatch between Prisma definitions and actual PostgreSQL database
- Enum types were defined in Prisma schema but not created in the database
- Existing tournament data was incompatible with new enum requirements

#### Solution Applied
**Method:** Complete Table Recreation

1. **Backup existing data:**
   ```sql
   CREATE TABLE tournaments_backup AS SELECT * FROM tournaments;
   ```

2. **Drop and recreate table with proper enum types:**
   ```sql
   DROP TABLE tournaments CASCADE;
   
   CREATE TABLE tournaments (
     id TEXT NOT NULL PRIMARY KEY,
     "organizerId" TEXT NOT NULL,
     title TEXT NOT NULL,
     sport TEXT NOT NULL,
     date TIMESTAMP(3) NOT NULL,
     "entryFee" DECIMAL(10,2) NOT NULL,
     "maxParticipants" INTEGER NOT NULL DEFAULT 32,
     status "TournamentStatus" NOT NULL DEFAULT 'DRAFT'::"TournamentStatus",
     "venueId" TEXT,
     "currentRound" TEXT,
     "progressionData" JSONB,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL
   );
   ```

3. **Restore data with proper enum conversion:**
   ```sql
   INSERT INTO tournaments 
   SELECT 
     id, "organizerId", title, sport, date, "entryFee", "maxParticipants",
     CASE 
       WHEN status = 'ACTIVE' THEN 'ACTIVE'::"TournamentStatus"
       WHEN status = 'COMPLETED' THEN 'COMPLETED'::"TournamentStatus"
       WHEN status = 'DRAFT' THEN 'DRAFT'::"TournamentStatus"
       WHEN status = 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'::"TournamentStatus"
       WHEN status = 'ARCHIVED' THEN 'ARCHIVED'::"TournamentStatus"
       WHEN status = 'CANCELLED' THEN 'CANCELLED'::"TournamentStatus"
       ELSE 'DRAFT'::"TournamentStatus"
     END as status,
     "venueId", "currentRound", "progressionData", "createdAt", "updatedAt"
   FROM tournaments_backup;
   ```

4. **Clean up:**
   ```sql
   DROP TABLE tournaments_backup;
   ```

#### Files Modified
- `prisma/schema.prisma` - Enum definitions
- `app/api/tournaments/route.ts` - Enhanced with fallback to raw SQL
- `app/api/test-enums/route.ts` - Added better error handling
- `app/api/setup-db/route.ts` - Created for future deployments
- `app/api/migrate/route.ts` - Created for schema migrations
- `app/api/fix-enums/route.ts` - Created for enum fixes
- `app/api/force-fix/route.ts` - Created for comprehensive fixes
- `app/api/fix-existing-data/route.ts` - Created for data conversion

#### Cursor Prompts Used
1. **Initial Issue Report:**
   ```
   "we are in the right project directory: Please go through the below error and resolve it:"
   ```

2. **Follow-up Debugging:**
   ```
   "I have tried all the Recommended Steps, please see the attached images for error messages."
   ```

3. **Manual Database Fix:**
   ```
   "ERROR: default for column "status" cannot be cast automatically to type "TournamentStatus" (SQLSTATE 42804)"
   ```

#### Prevention Measures
- Created `/api/setup-db` endpoint for future deployments
- Created `/api/migrate` endpoint for schema updates
- Enhanced error handling in API routes
- Added fallback mechanisms for enum issues

#### Testing
- ✅ `GET /api/test-enums` returns 200 OK
- ✅ `GET /api/tournaments` loads tournament data
- ✅ Main application homepage displays correctly
- ✅ Tournament cards show proper data
- ✅ No more PostgreSQL enum errors

#### Lessons Learned
1. **Always create enum types in database before using them in Prisma**
2. **Use complete table recreation for complex type conversions**
3. **Backup data before making schema changes**
4. **Test API endpoints after database changes**
5. **Create utility endpoints for future maintenance**

---

## 🔧 Prevention Checklist

### Before Making Schema Changes
- [ ] Backup existing data
- [ ] Test changes in development environment first
- [ ] Create migration scripts
- [ ] Document the change process

### After Resolving Issues
- [ ] Test all affected endpoints
- [ ] Update this documentation
- [ ] Create prevention measures
- [ ] Share solution with team (if applicable)

### Regular Maintenance
- [ ] Review this log monthly
- [ ] Update prevention measures
- [ ] Clean up temporary fix files
- [ ] Archive resolved issues

---

## 📚 Related Documentation
- [Deployment Guide](./DEPLOYMENT.md)
- [Technical Implementation](./TECHNICAL_IMPLEMENTATION.md)
- [Tournament Progression Guide](./TOURNAMENT_PROGRESSION_GUIDE.md)

---

## 🏷️ Tags for Quick Reference
- `postgresql` - Database-related issues
- `enum` - Enum type problems
- `deployment` - Vercel/deployment issues
- `prisma` - Prisma ORM issues
- `api` - API endpoint problems
- `schema` - Database schema changes
