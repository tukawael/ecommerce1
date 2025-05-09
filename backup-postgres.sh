#!/bin/bash

# Exit on error
set -e

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"

# Load environment variables
source .env

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create a PostgreSQL dump
echo "Creating database dump..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
  -U $PGUSER \
  -d $PGDATABASE > $BACKUP_DIR/ecommerce_$TIMESTAMP.sql

# Clean up old backups (keep only the last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -type f -name "ecommerce_*.sql" -mtime +7 -exec rm -f {} \;

echo "Backup completed: $BACKUP_DIR/ecommerce_$TIMESTAMP.sql"