# Database Management Scripts

This directory contains comprehensive scripts for managing your local and production databases, including cleaning duplicate data and syncing between environments.

## 📁 Script Overview

### 🧹 **Cleaning Scripts**
- `clean-local-db.sh` / `clean-local-db.bat` - Remove duplicates from local database
- `clean-production-db.sh` / `clean-production-db.bat` - Remove duplicates from production database

### 💥 **Reset Scripts**
- `reset-local-db.sh` / `reset-local-db.bat` - Complete local database reset + seed
- `reset-production-db.sh` / `reset-production-db.bat` - Complete production database reset

### 📤 **Export/Import Scripts**
- `export-clean-data.sh` / `export-clean-data.bat` - Export clean data from local
- `import-clean-data.sh` / `import-clean-data.bat` - Import clean data to production

### 🎛️ **Management Scripts**
- `db-manager.sh` / `db-manager.bat` - Menu-driven interface for all operations

## 🚀 **Quick Start**

### **Option 1: Use the Manager Script (Recommended)**
```bash
# Linux/Mac
./scripts/db-manager.sh

# Windows
scripts\db-manager.bat
```

### **Option 2: Manual Step-by-Step Process**

#### **Step 1: Clean Local Database**
```bash
# Linux/Mac
./scripts/clean-local-db.sh

# Windows
scripts\clean-local-db.bat
```

#### **Step 2: Export Clean Data**
```bash
# Linux/Mac
./scripts/export-clean-data.sh

# Windows
scripts\export-clean-data.bat
```

#### **Step 3: Clean Production Database**
```bash
# Linux/Mac
./scripts/clean-production-db.sh

# Windows
scripts\clean-production-db.bat
```

#### **Step 4: Import Clean Data**
```bash
# Linux/Mac
./scripts/import-clean-data.sh

# Windows
scripts\import-clean-data.bat
```

## ⚙️ **Prerequisites**

### **Environment Files**
Create these files in your project root:

#### **`.env.local`** (for local database)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sports_india"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

#### **`.env.production`** (for production database)
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### **Required Tools**
- **PostgreSQL client tools** (`psql`, `pg_dump`)
- **Node.js** and **npm**
- **Prisma CLI** (`npx prisma`)

## 📋 **Detailed Script Descriptions**

### **🧹 Cleaning Scripts**

#### **`clean-local-db.sh`**
- **Purpose**: Remove duplicate records from local database
- **What it does**:
  - Creates backup before cleaning
  - Removes duplicate tournaments, organizers, venues, registrations, judges, payments
  - Cleans orphaned records
  - Shows before/after counts
- **Safety**: Creates automatic backup
- **Use when**: You have duplicate data in local development

#### **`clean-production-db.sh`**
- **Purpose**: Remove duplicate records from production database
- **What it does**:
  - Creates comprehensive backup
  - Removes duplicates (same logic as local)
  - Cleans orphaned records
  - Shows before/after counts
- **Safety**: Multiple confirmations + automatic backup
- **Use when**: Production has duplicate data

### **💥 Reset Scripts**

#### **`reset-local-db.sh`**
- **Purpose**: Complete local database reset
- **What it does**:
  - Creates backup
  - Drops all tables
  - Recreates schema
  - Seeds with clean data
- **Safety**: Backup + confirmation
- **Use when**: Local database is completely corrupted

#### **`reset-production-db.sh`**
- **Purpose**: Complete production database reset
- **What it does**:
  - Creates comprehensive backup
  - Deletes ALL data (except users)
  - Multiple safety confirmations
- **Safety**: Multiple confirmations + comprehensive backup
- **Use when**: Production database needs complete reset

### **📤 Export/Import Scripts**

#### **`export-clean-data.sh`**
- **Purpose**: Export clean data from local database
- **What it does**:
  - Exports all tables as JSON
  - Creates timestamped export file
  - Shows export summary
- **Output**: `exports/clean-data-YYYYMMDD-HHMMSS.json`
- **Use when**: You have clean local data to sync to production

#### **`import-clean-data.sh`**
- **Purpose**: Import clean data to production database
- **What it does**:
  - Finds latest export file
  - Creates production backup
  - Imports data in correct order
  - Shows import summary
- **Safety**: Production backup + confirmation
- **Use when**: You want to sync clean local data to production

## 🔒 **Safety Features**

### **Automatic Backups**
- All scripts create backups before making changes
- Backups are timestamped for easy identification
- Production backups are comprehensive

### **Confirmation Prompts**
- Production scripts require explicit confirmation
- Reset scripts require multiple confirmations
- Clear warnings about data loss

### **Error Handling**
- Scripts exit on errors
- Clear error messages
- Rollback instructions

## 📊 **Monitoring and Verification**

### **Count Reports**
All scripts show:
- Before/after record counts
- Summary of operations performed
- File locations for backups/exports

### **Status Checking**
Use the manager script to check:
- Database connection status
- Available exports
- Current record counts

## 🚨 **Important Warnings**

### **Production Database**
- ⚠️ **NEVER** run production scripts without backups
- ⚠️ **ALWAYS** test on local first
- ⚠️ **CONFIRM** you're targeting the right database

### **Data Loss**
- Reset scripts **DELETE ALL DATA**
- Clean scripts **REMOVE DUPLICATES**
- Always **BACKUP FIRST**

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"psql: command not found"**
```bash
# Install PostgreSQL client tools
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### **"Permission denied"**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### **"DATABASE_URL not found"**
- Check `.env.local` and `.env.production` files exist
- Verify DATABASE_URL format is correct
- Ensure no extra spaces or quotes

#### **"Connection failed"**
- Verify database credentials
- Check if database server is running
- Test connection manually with `psql`

### **Recovery Procedures**

#### **If Production Script Fails**
1. Check the backup file created
2. Restore from backup if needed
3. Contact support if data is lost

#### **If Import Fails**
1. Check export file exists and is valid
2. Verify production database is empty
3. Try manual import using SQL

## 📚 **Best Practices**

### **Before Running Scripts**
1. ✅ Test on local database first
2. ✅ Verify environment files are correct
3. ✅ Ensure you have database access
4. ✅ Plan for downtime (production scripts)

### **After Running Scripts**
1. ✅ Verify data integrity
2. ✅ Test application functionality
3. ✅ Keep backup files safe
4. ✅ Update documentation

### **Regular Maintenance**
1. ✅ Run cleanup scripts monthly
2. ✅ Monitor for duplicate data
3. ✅ Keep scripts updated
4. ✅ Document any customizations

## 🆘 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Check the backup files created
4. Contact your development team

---

**Remember**: Always backup before running any database scripts, especially on production!
