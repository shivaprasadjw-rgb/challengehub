# Windows Batch Files for Database Management

This directory contains Windows batch files for managing your PostgreSQL database, including the SQL reset database script with actual values.

## 📁 Windows Batch Files Overview

### 🛠️ **Setup Scripts**
- `setup-database-config.bat` - Interactive setup for database configuration
- `database-config-template.env` - Template for database configuration

### 💥 **Reset Scripts**
- `sql-reset-database.bat` - Basic database reset with manual configuration
- `sql-reset-database-enhanced.bat` - Enhanced version with automatic DATABASE_URL parsing

## 🚀 **Quick Start Guide**

### **Step 1: Setup Database Configuration**
```cmd
scripts\setup-database-config.bat
```
This will create a `.env.local` file with your database connection details.

### **Step 2: Run Database Reset**
```cmd
scripts\sql-reset-database-enhanced.bat
```
This will automatically parse your `.env.local` file and reset the database.

## 📋 **Detailed Script Descriptions**

### **🛠️ `setup-database-config.bat`**

**Purpose**: Interactive setup for database configuration

**What it does**:
- ✅ Prompts for database connection details
- ✅ Creates `.env.local` file with proper format
- ✅ Sets up NextAuth configuration
- ✅ Provides default values for common settings

**Usage**:
```cmd
scripts\setup-database-config.bat
```

**Example Output**:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/sports_india"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### **💥 `sql-reset-database.bat`**

**Purpose**: Basic database reset with manual configuration

**What it does**:
- ✅ Uses hardcoded database connection details
- ✅ Creates comprehensive backup
- ✅ Executes SQL reset script
- ✅ Verifies reset results

**Configuration**:
Edit the script to set your database details:
```batch
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=sports_india
set DB_PASSWORD=
```

**Usage**:
```cmd
scripts\sql-reset-database.bat
```

### **💥 `sql-reset-database-enhanced.bat`**

**Purpose**: Enhanced database reset with automatic configuration parsing

**What it does**:
- ✅ Automatically parses `.env.local` file
- ✅ Extracts DATABASE_URL components
- ✅ Creates comprehensive backup with actual values
- ✅ Executes SQL reset script
- ✅ Provides detailed feedback

**Features**:
- Automatic DATABASE_URL parsing
- Fallback to default configuration
- Detailed error handling
- Progress feedback

**Usage**:
```cmd
scripts\sql-reset-database-enhanced.bat
```

**Example DATABASE_URL formats supported**:
```
postgresql://user:pass@localhost:5432/database
postgresql://postgres:password@localhost:5432/sports_india
postgresql://prod_user:prod_pass@prod-host.com:5432/prod_database
```

## 🔧 **Configuration Options**

### **Environment File (.env.local)**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:port/database_name"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### **Manual Configuration**
Edit the batch file to set your values:
```batch
set DB_HOST=your-host
set DB_PORT=5432
set DB_USER=your-username
set DB_NAME=your-database
set DB_PASSWORD=your-password
```

## 🔒 **Safety Features**

### **Automatic Backups**
- All scripts create timestamped backups
- Uses actual database connection values
- Comprehensive backup with pg_dump

### **Multiple Confirmations**
- Requires typing "DELETE ALL DATA"
- Requires typing "YES" to proceed
- Shows database configuration before proceeding

### **Error Handling**
- Checks for required files
- Validates database connections
- Provides clear error messages
- Exits gracefully on errors

## 📊 **Backup Information**

### **Backup File Format**
```
full_backup_YYYYMMDD_HHMMSS.sql
```

### **Backup Command Used**
```cmd
pg_dump -h hostname -p port -U username -d database_name > backup_file.sql
```

### **Backup Contents**
- Complete database schema
- All data from all tables
- Indexes and constraints
- Ready for full restore

## 🚨 **Important Warnings**

### **Data Loss**
- ⚠️ These scripts **DELETE ALL DATA**
- ⚠️ Always **BACKUP FIRST**
- ⚠️ Test on development database first

### **Prerequisites**
- PostgreSQL client tools installed (`pg_dump`, `psql`)
- Database connection details
- Proper permissions on database

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"pg_dump: command not found"**
```cmd
# Install PostgreSQL client tools
# Download from: https://www.postgresql.org/download/windows/
```

#### **"Permission denied"**
- Check database user permissions
- Ensure user can connect to database
- Verify password is correct

#### **"Connection failed"**
- Verify database server is running
- Check hostname and port
- Test connection manually

#### **"Database does not exist"**
- Create database first
- Check database name spelling
- Verify user has access

### **Recovery Procedures**

#### **If Script Fails**
1. Check the error message
2. Restore from backup if needed
3. Fix configuration issues
4. Re-run the script

#### **If Data is Lost**
1. Restore from backup file
2. Check backup file integrity
3. Contact support if needed

## 📚 **Best Practices**

### **Before Running Scripts**
1. ✅ Create comprehensive backup
2. ✅ Test on development database first
3. ✅ Verify database connection
4. ✅ Plan for downtime

### **After Running Scripts**
1. ✅ Verify data integrity
2. ✅ Test application functionality
3. ✅ Keep backup files safe
4. ✅ Update documentation

### **Regular Maintenance**
1. ✅ Run scripts monthly
2. ✅ Monitor database health
3. ✅ Clean up old backups
4. ✅ Update scripts as needed

## 🆘 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages carefully
3. Check your backup files
4. Contact your development team

---

**Remember**: Always backup before running any database scripts, especially on production!
