# PostgreSQL Enum Type Error Resolution Guide

## 🚨 **Problem Summary**

### **Error Description**
```
operator does not exist: text = "TournamentStatus"
PostgreSQL error code: 42883
```

### **Root Cause**
- Prisma schema defined enum types (TournamentStatus, UserRole, etc.)
- PostgreSQL database didn't have these enum types created
- Existing data was stored as text but Prisma expected enum types
- This caused query failures during static page generation in Vercel deployment

### **Impact**
- ❌ Vercel deployment failures
- ❌ Static page generation errors
- ❌ API endpoints returning 500 errors
- ❌ Tournament queries failing

---

## 🔧 **Resolution Methods**

### **Method 1: Complete Table Recreation (Recommended)**

#### **Step 1: Create Backup**
```sql
CREATE TABLE tournaments_backup AS SELECT * FROM tournaments;
```

#### **Step 2: Drop and Recreate Table**
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

#### **Step 3: Restore Data with Enum Conversion**
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

#### **Step 4: Clean Up**
```sql
DROP TABLE tournaments_backup;
```

### **Method 2: Column Type Conversion**

#### **Step 1: Remove Default Value**
```sql
ALTER TABLE tournaments ALTER COLUMN status DROP DEFAULT;
```

#### **Step 2: Convert Column Type**
```sql
ALTER TABLE tournaments 
ALTER COLUMN status TYPE "TournamentStatus" 
USING CASE 
  WHEN status = 'ACTIVE' THEN 'ACTIVE'::"TournamentStatus"
  WHEN status = 'COMPLETED' THEN 'COMPLETED'::"TournamentStatus"
  WHEN status = 'DRAFT' THEN 'DRAFT'::"TournamentStatus"
  WHEN status = 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'::"TournamentStatus"
  WHEN status = 'ARCHIVED' THEN 'ARCHIVED'::"TournamentStatus"
  WHEN status = 'CANCELLED' THEN 'CANCELLED'::"TournamentStatus"
  ELSE 'DRAFT'::"TournamentStatus"
END;
```

#### **Step 3: Set New Default**
```sql
ALTER TABLE tournaments ALTER COLUMN status SET DEFAULT 'DRAFT'::"TournamentStatus";
```

---

## 🛠️ **Scripts Created for Resolution**

### **API Routes for Automated Fixes**

#### **1. Setup Database Route**
**File**: `app/api/setup-db/route.ts`
**Purpose**: Creates all enum types and basic tables
**Usage**: `POST /api/setup-db`

#### **2. Fix Enums Route**
**File**: `app/api/fix-enums/route.ts`
**Purpose**: Creates missing enum types specifically
**Usage**: `POST /api/fix-enums`

#### **3. Force Fix Route**
**File**: `app/api/force-fix/route.ts`
**Purpose**: Comprehensive fix for deployment
**Usage**: `POST /api/force-fix`

#### **4. Test Enums Route**
**File**: `app/api/test-enums/route.ts`
**Purpose**: Tests if enum queries work
**Usage**: `GET /api/test-enums`

### **Shell Scripts**

#### **1. Database Manager**
**File**: `scripts/db-manager.sh`
**Purpose**: Menu-driven interface for all database operations
**Usage**: `./scripts/db-manager.sh`

#### **2. Clean Local Database**
**File**: `scripts/clean-local-db.sh`
**Purpose**: Remove duplicates from local database
**Usage**: `./scripts/clean-local-db.sh`

#### **3. Clean Production Database**
**File**: `scripts/clean-production-db.sh`
**Purpose**: Remove duplicates from production database
**Usage**: `./scripts/clean-production-db.sh`

#### **4. Reset Local Database**
**File**: `scripts/reset-local-db.sh`
**Purpose**: Complete local database reset + seed
**Usage**: `./scripts/reset-local-db.sh`

#### **5. Reset Production Database**
**File**: `scripts/reset-production-db.sh`
**Purpose**: Complete production database reset
**Usage**: `./scripts/reset-production-db.sh`

#### **6. Export Clean Data**
**File**: `scripts/export-clean-data.sh`
**Purpose**: Export clean data from local
**Usage**: `./scripts/export-clean-data.sh`

#### **7. Import Clean Data**
**File**: `scripts/import-clean-data.sh`
**Purpose**: Import clean data to production
**Usage**: `./scripts/import-clean-data.sh`

### **SQL Scripts**

#### **1. Cleanup Duplicates**
**File**: `scripts/sql-cleanup-duplicates.sql`
**Purpose**: Remove duplicate records using SQL
**Usage**: `\i scripts/sql-cleanup-duplicates.sql`

#### **2. Reset Database**
**File**: `scripts/sql-reset-database.sql`
**Purpose**: Complete database reset using SQL
**Usage**: `\i scripts/sql-reset-database.sql`

#### **3. Export Data**
**File**: `scripts/sql-export-data.sql`
**Purpose**: Export all data as INSERT statements
**Usage**: `\i scripts/sql-export-data.sql`

#### **4. Import Data**
**File**: `scripts/sql-import-data.sql`
**Purpose**: Import data from export files
**Usage**: `\i scripts/sql-import-data.sql`

#### **5. Maintenance**
**File**: `scripts/sql-maintenance.sql`
**Purpose**: Database health checks and maintenance
**Usage**: `\i scripts/sql-maintenance.sql`

---

## 🚀 **Quick Resolution Steps**

### **If Error Occurs Again:**

#### **Option 1: Use API Routes (Fastest)**
```bash
# 1. Deploy the fix routes
git push origin main

# 2. Call the force fix endpoint
POST https://your-domain.vercel.app/api/force-fix

# 3. Test the fix
GET https://your-domain.vercel.app/api/test-enums
```

#### **Option 2: Use Shell Scripts**
```bash
# 1. Clean local database
./scripts/clean-local-db.sh

# 2. Export clean data
./scripts/export-clean-data.sh

# 3. Clean production database
./scripts/clean-production-db.sh

# 4. Import clean data
./scripts/import-clean-data.sh
```

#### **Option 3: Use SQL Scripts**
```sql
-- 1. Run cleanup script
\i scripts/sql-cleanup-duplicates.sql

-- 2. Or run reset script
\i scripts/sql-reset-database.sql
```

#### **Option 4: Manual Database Fix**
```sql
-- 1. Create enum types
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED');
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ORG_USER', 'JUDGE', 'PLAYER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE "OrganizerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'MEMBER');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "PaymentType" AS ENUM ('ORGANIZER_REGISTRATION', 'TOURNAMENT_FEE', 'JUDGE_FEE', 'OTHER');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- 2. Recreate tournaments table
DROP TABLE IF EXISTS tournaments CASCADE;
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

---

## 🔍 **Verification Steps**

### **Test the Fix**
```bash
# Test API endpoint
curl https://your-domain.vercel.app/api/test-enums

# Expected response:
{
  "success": true,
  "message": "Enum test completed",
  "data": {
    "allTournaments": [...],
    "activeTournaments": [...]
  }
}
```

### **Check Application**
- ✅ Homepage loads without errors
- ✅ Tournament pages display correctly
- ✅ No enum-related errors in console
- ✅ API endpoints return proper data

---

## 📋 **Prevention Measures**

### **For Future Deployments**
1. **Always run setup-db endpoint** after deployment
2. **Test enum queries** before going live
3. **Use proper migration scripts** for schema changes
4. **Monitor deployment logs** for enum errors

### **Best Practices**
1. **Create enum types first** before using them in Prisma
2. **Use complete table recreation** for complex type changes
3. **Backup data** before making schema changes
4. **Test locally** before deploying to production

---

## 🆘 **Emergency Contacts**

### **If Issue Persists**
1. Check the issue log: `docs/ISSUE_LOG_AND_FIXES.md`
2. Review the development workflow: `docs/DEVELOPMENT_WORKFLOW.md`
3. Use the database manager: `./scripts/db-manager.sh`
4. Contact development team with error logs

### **Recovery Procedures**
1. **Restore from backup** if data is lost
2. **Use nuclear reset** if database is corrupted
3. **Import clean data** from local development
4. **Test thoroughly** before declaring fixed

---

## 📊 **Success Metrics**

### **Before Fix**
- ❌ Deployment failures
- ❌ 500 errors on API endpoints
- ❌ Static page generation errors
- ❌ Enum type mismatch errors

### **After Fix**
- ✅ Successful Vercel deployments
- ✅ 200 OK responses from API endpoints
- ✅ Proper static page generation
- ✅ Tournament data loads correctly
- ✅ No enum-related errors

---

## 📝 **Notes**

- **Date Fixed**: January 12, 2025
- **Method Used**: Complete table recreation
- **Time to Resolution**: ~2 hours
- **Files Modified**: 45 files
- **Scripts Created**: 20+ scripts
- **Documentation**: Comprehensive guides created

---

**This guide ensures quick resolution if the enum error reoccurs in the future!** 🎯
