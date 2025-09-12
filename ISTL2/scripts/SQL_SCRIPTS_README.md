# SQL Database Management Scripts

This directory contains comprehensive SQL scripts for managing your PostgreSQL database, including cleaning duplicate data, resetting databases, and maintaining data integrity.

## 📁 SQL Scripts Overview

### 🧹 **Cleaning Scripts**
- `sql-cleanup-duplicates.sql` - Remove duplicate records from database
- `sql-maintenance.sql` - Database health checks and maintenance

### 💥 **Reset Scripts**
- `sql-reset-database.sql` - Complete database reset (DELETE ALL DATA)

### 📤 **Export/Import Scripts**
- `sql-export-data.sql` - Export all data as INSERT statements
- `sql-import-data.sql` - Import data from export files

## 🚀 **Quick Start Guide**

### **Step 1: Create Backup**
Before running any scripts, create a backup:
```bash
pg_dump -h hostname -p port -U username -d database_name > backup_YYYYMMDD_HHMMSS.sql
```

### **Step 2: Clean Duplicates**
```sql
-- Run in your PostgreSQL client
\i scripts/sql-cleanup-duplicates.sql
```

### **Step 3: Export Clean Data**
```sql
-- Run in your PostgreSQL client
\i scripts/sql-export-data.sql
-- Copy the generated INSERT statements to files
```

### **Step 4: Import to Production**
```sql
-- Run in your PostgreSQL client
\i scripts/sql-import-data.sql
-- Paste your export data into the script
```

## 📋 **Detailed Script Descriptions**

### **🧹 `sql-cleanup-duplicates.sql`**

**Purpose**: Remove duplicate records while preserving data integrity

**What it does**:
- ✅ Shows current data counts
- ✅ Identifies duplicate records
- ✅ Removes duplicates (keeps oldest record)
- ✅ Cleans orphaned records
- ✅ Verifies cleanup results
- ✅ Performs data integrity checks

**Usage**:
```sql
-- Run the entire script
\i scripts/sql-cleanup-duplicates.sql

-- Or run individual sections:
-- 1. Check current counts
-- 2. Find duplicates
-- 3. Clean duplicates
-- 4. Verify results
```

**Safety Features**:
- Shows before/after counts
- Identifies what will be deleted
- Verifies data integrity after cleanup

### **💥 `sql-reset-database.sql`**

**Purpose**: Complete database reset (DELETE ALL DATA)

**What it does**:
- ✅ Shows current data counts
- ✅ Deletes all data (except users)
- ✅ Resets sequences
- ✅ Verifies reset
- ✅ Provides alternative drop/recreate option

**⚠️ WARNING**: This will DELETE ALL DATA!

**Usage**:
```sql
-- Run the entire script
\i scripts/sql-reset-database.sql

-- Or use the alternative drop/recreate section
```

**Safety Features**:
- Multiple warnings
- Shows what will be deleted
- Option to keep users for authentication

### **📤 `sql-export-data.sql`**

**Purpose**: Export all data as INSERT statements

**What it does**:
- ✅ Exports users, organizers, venues, tournaments
- ✅ Exports registrations, judges, payments, audit logs
- ✅ Generates INSERT statements
- ✅ Shows export summary
- ✅ Provides usage instructions

**Usage**:
```sql
-- Run each export query
\i scripts/sql-export-data.sql

-- Copy the output to separate files:
-- export_users.sql
-- export_organizers.sql
-- export_venues.sql
-- etc.
```

**Output**: INSERT statements ready for import

### **📥 `sql-import-data.sql`**

**Purpose**: Import data from export files

**What it does**:
- ✅ Shows pre-import data counts
- ✅ Provides option to clear existing data
- ✅ Imports data in correct order (respects foreign keys)
- ✅ Verifies import results
- ✅ Performs data integrity checks

**Usage**:
```sql
-- 1. Paste your export data into the script
-- 2. Run the script
\i scripts/sql-import-data.sql
```

**Import Order**:
1. Users
2. Organizers
3. Venues
4. Tournaments
5. Judges
6. Payments
7. Registrations
8. Audit Logs

### **🔧 `sql-maintenance.sql`**

**Purpose**: Database health checks and maintenance

**What it does**:
- ✅ Database health overview
- ✅ Table size analysis
- ✅ Performance analysis
- ✅ Data quality checks
- ✅ Cleanup old data
- ✅ Optimization scripts
- ✅ Backup verification
- ✅ Security checks
- ✅ Monitoring queries
- ✅ Emergency procedures

**Usage**:
```sql
-- Run individual sections as needed
\i scripts/sql-maintenance.sql

-- Or run specific queries:
-- Health check
-- Performance analysis
-- Data quality checks
-- etc.
```

## 🔒 **Safety Features**

### **Automatic Verification**
- All scripts show before/after counts
- Data integrity checks after operations
- Orphaned record detection
- Duplicate detection

### **Clear Warnings**
- Reset scripts have multiple warnings
- Clear indication of what will be deleted
- Safety confirmations

### **Rollback Instructions**
- Backup creation instructions
- Recovery procedures
- Error handling guidance

## 📊 **Monitoring and Verification**

### **Count Reports**
All scripts provide:
- Before/after record counts
- Summary of operations performed
- Data integrity verification

### **Health Checks**
The maintenance script includes:
- Database size analysis
- Performance metrics
- Data quality checks
- Security verification

## 🚨 **Important Warnings**

### **Production Database**
- ⚠️ **NEVER** run reset scripts without backups
- ⚠️ **ALWAYS** test on local first
- ⚠️ **CONFIRM** you're targeting the right database

### **Data Loss**
- Reset scripts **DELETE ALL DATA**
- Clean scripts **REMOVE DUPLICATES**
- Always **BACKUP FIRST**

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Permission denied"**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

#### **"Foreign key constraint"**
- Run scripts in the correct order
- Use the provided import order
- Check for orphaned records first

#### **"Connection failed"**
- Verify database credentials
- Check if database server is running
- Test connection manually

### **Recovery Procedures**

#### **If Script Fails**
1. Check the error message
2. Restore from backup if needed
3. Run individual sections instead of full script

#### **If Data is Lost**
1. Restore from backup
2. Check backup file integrity
3. Contact support if needed

## 📚 **Best Practices**

### **Before Running Scripts**
1. ✅ Create comprehensive backup
2. ✅ Test on development database first
3. ✅ Verify you're connected to correct database
4. ✅ Plan for downtime (production scripts)

### **After Running Scripts**
1. ✅ Verify data integrity
2. ✅ Test application functionality
3. ✅ Monitor for issues
4. ✅ Update documentation

### **Regular Maintenance**
1. ✅ Run maintenance scripts monthly
2. ✅ Monitor database health
3. ✅ Clean up old data regularly
4. ✅ Update scripts as needed

## 🆘 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Check your backup files
4. Contact your development team

---

**Remember**: Always backup before running any database scripts, especially on production!
