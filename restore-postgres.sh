#!/bin/bash

# Check if a backup file is provided
if [ -z "$1" ]; then
    echo "Error: Backup file path is required"
    echo "Usage: $0 /path/to/backup.sql"
    exit 1
fi

BACKUP_FILE=$1

# Make sure the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file does not exist: $BACKUP_FILE"
    exit 1
fi

# Get the database environment variables from .env file if not set
if [ -z "$PGUSER" ] || [ -z "$PGPASSWORD" ] || [ -z "$PGDATABASE" ]; then
    if [ -f .env ]; then
        source .env
    else
        echo "Error: .env file not found and environment variables not set"
        exit 1
    fi
fi

echo "Restoring PostgreSQL database from backup..."
echo "Database: $PGDATABASE"
echo "Backup file: $BACKUP_FILE"

# Confirm with the user
read -p "This will overwrite your current database. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled"
    exit 0
fi

# Restore the database
cat "$BACKUP_FILE" | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $PGUSER -d $PGDATABASE

echo "Database restore completed."