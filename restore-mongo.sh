#!/bin/bash

# Exit on error
set -e

# Check if backup path is provided
if [ -z "$1" ]; then
  echo "Please provide the backup directory path."
  echo "Usage: $0 /path/to/backup/directory"
  exit 1
fi

BACKUP_PATH=$1

# Load environment variables
source .env

# Check if the backup directory exists
if [ ! -d "$BACKUP_PATH" ]; then
  echo "Backup directory not found: $BACKUP_PATH"
  exit 1
fi

# Create a temporary directory
TMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TMP_DIR"

# Copy backup to temporary directory
echo "Copying backup to temporary directory..."
cp -r $BACKUP_PATH/* $TMP_DIR/

# Copy the backup into the MongoDB container
echo "Copying backup to MongoDB container..."
docker cp $TMP_DIR $(docker-compose -f docker-compose.prod.yml ps -q mongodb):/tmp/restore

# Restore the database
echo "Restoring database..."
docker-compose -f docker-compose.prod.yml exec -T mongodb mongorestore \
  --username=$MONGO_USERNAME \
  --password=$MONGO_PASSWORD \
  --authenticationDatabase=admin \
  --nsInclude=ecommerce.* \
  --drop \
  /tmp/restore

# Clean up
echo "Cleaning up..."
rm -rf $TMP_DIR
docker-compose -f docker-compose.prod.yml exec -T mongodb rm -rf /tmp/restore

echo "Restore completed from: $BACKUP_PATH"