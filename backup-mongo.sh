#!/bin/bash

# Exit on error
set -e

# Get current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"

# Load environment variables
source .env

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create a MongoDB dump
echo "Creating database dump..."
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump \
  --username=$MONGO_USERNAME \
  --password=$MONGO_PASSWORD \
  --authenticationDatabase=admin \
  --db=ecommerce \
  --out=/dump

# Copy the dump from the container to the host
echo "Copying dump to backup directory..."
docker cp $(docker-compose -f docker-compose.prod.yml ps -q mongodb):/dump/ecommerce $BACKUP_DIR/ecommerce_$TIMESTAMP

# Clean up old backups (keep only the last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -type d -name "ecommerce_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/ecommerce_$TIMESTAMP"