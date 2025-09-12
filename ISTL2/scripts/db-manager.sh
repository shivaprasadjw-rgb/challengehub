#!/bin/bash

# Database Management Script - Master Control
# This script provides a menu-driven interface for all database operations

echo "🗄️  Database Management Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to show menu
show_menu() {
    echo ""
    echo "Select an operation:"
    echo "1. Clean Local Database (remove duplicates)"
    echo "2. Reset Local Database (complete reset + seed)"
    echo "3. Export Clean Data from Local"
    echo "4. Clean Production Database (remove duplicates)"
    echo "5. Reset Production Database (complete reset)"
    echo "6. Import Clean Data to Production"
    echo "7. Show Database Status"
    echo "8. Exit"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    local operation=$1
    
    case $operation in
        "1"|"2"|"3")
            if [ ! -f ".env.local" ]; then
                echo "❌ Error: .env.local file not found"
                echo "Please create it with your local DATABASE_URL"
                return 1
            fi
            ;;
        "4"|"5"|"6")
            if [ ! -f ".env.production" ]; then
                echo "❌ Error: .env.production file not found"
                echo "Please create it with your production DATABASE_URL"
                return 1
            fi
            ;;
    esac
    return 0
}

# Function to execute operation
execute_operation() {
    local choice=$1
    
    case $choice in
        "1")
            echo "🧹 Cleaning Local Database..."
            if check_prerequisites "1"; then
                ./scripts/clean-local-db.sh
            fi
            ;;
        "2")
            echo "💥 Resetting Local Database..."
            if check_prerequisites "2"; then
                ./scripts/reset-local-db.sh
            fi
            ;;
        "3")
            echo "📤 Exporting Clean Data from Local..."
            if check_prerequisites "3"; then
                ./scripts/export-clean-data.sh
            fi
            ;;
        "4")
            echo "🧹 Cleaning Production Database..."
            if check_prerequisites "4"; then
                ./scripts/clean-production-db.sh
            fi
            ;;
        "5")
            echo "💥 Resetting Production Database..."
            if check_prerequisites "5"; then
                ./scripts/reset-production-db.sh
            fi
            ;;
        "6")
            echo "📥 Importing Clean Data to Production..."
            if check_prerequisites "6"; then
                ./scripts/import-clean-data.sh
            fi
            ;;
        "7")
            echo "📊 Database Status..."
            show_database_status
            ;;
        "8")
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
}

# Function to show database status
show_database_status() {
    echo ""
    echo "📊 Database Status"
    echo "=================="
    
    # Check local database
    if [ -f ".env.local" ]; then
        echo ""
        echo "🏠 Local Database:"
        export $(cat .env.local | grep -v '^#' | xargs)
        if [ ! -z "$DATABASE_URL" ]; then
            DB_URL=$(echo $DATABASE_URL | sed 's/postgresql:\/\///')
            DB_USER=$(echo $DB_URL | cut -d':' -f1)
            DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
            DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
            DB_PORT=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f2 | cut -d'/' -f1)
            DB_NAME=$(echo $DB_URL | cut -d'/' -f2)
            
            echo "   Connection: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
            
            # Try to get counts
            PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
            SELECT 
                'Tournaments' as table_name, COUNT(*) as count FROM tournaments 
            UNION ALL 
            SELECT 'Organizers', COUNT(*) FROM organizers 
            UNION ALL 
            SELECT 'Venues', COUNT(*) FROM venues 
            UNION ALL 
            SELECT 'Registrations', COUNT(*) FROM registrations;
            " 2>/dev/null || echo "   Status: Connection failed"
        else
            echo "   Status: DATABASE_URL not configured"
        fi
    else
        echo ""
        echo "🏠 Local Database: Not configured (.env.local not found)"
    fi
    
    # Check production database
    if [ -f ".env.production" ]; then
        echo ""
        echo "🌐 Production Database:"
        export $(cat .env.production | grep -v '^#' | xargs)
        if [ ! -z "$DATABASE_URL" ]; then
            echo "   Connection: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
            echo "   Status: Configured (counts not shown for security)"
        else
            echo "   Status: DATABASE_URL not configured"
        fi
    else
        echo ""
        echo "🌐 Production Database: Not configured (.env.production not found)"
    fi
    
    # Check exports
    echo ""
    echo "📁 Exports:"
    if [ -d "exports" ]; then
        EXPORT_COUNT=$(ls exports/clean-data-*.json 2>/dev/null | wc -l)
        if [ $EXPORT_COUNT -gt 0 ]; then
            echo "   Available exports: $EXPORT_COUNT"
            echo "   Latest: $(ls -t exports/clean-data-*.json 2>/dev/null | head -n1 | xargs basename)"
        else
            echo "   No exports available"
        fi
    else
        echo "   No exports directory"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-8): " choice
    execute_operation "$choice"
    
    if [ "$choice" != "8" ]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
done
