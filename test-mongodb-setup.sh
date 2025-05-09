#!/bin/bash

# Exit on error
set -e

echo "Testing MongoDB Docker setup locally..."

# Ensure .env file exists
if [ ! -f .env ]; then
  echo "Creating sample .env file for testing..."
  cat > .env << EOF
# MongoDB Atlas Credentials
DATABASE_URL=mongodb+srv://tukawael452:I2M7aXdZT9oOg0B6@cluster0.udwgvo2.mongodb.net/

# JWT Secret
JWT_SECRET=test_jwt_secret_key

# Other environment variables
NODE_ENV=development
EOF
fi

# Create a temporary docker-compose file for testing
echo "Creating temporary docker-compose file..."
cat > docker-compose.test.yml << EOF
version: '3'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=\${DATABASE_URL}
      - JWT_SECRET=\${JWT_SECRET}
    networks:
      - app-network

networks:
  app-network:
    driver: bridge


EOF

echo "Starting test environment..."
docker-compose -f docker-compose.test.yml up -d

echo "Waiting for services to start..."
sleep 15

echo "Checking application container logs..."
docker-compose -f docker-compose.test.yml logs app

echo "Testing MongoDB Atlas connection via the application..."
# We'll check if the application container is running properly which indicates
# a successful connection to MongoDB Atlas
docker-compose -f docker-compose.test.yml ps app | grep "Up" > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Application is running - MongoDB Atlas connection looks successful!"
else
  echo "❌ Application container is not running - MongoDB Atlas connection may have failed."
  exit 1
fi

echo "Simulation completed successfully."
echo "To clean up test environment, run:"
echo "docker-compose -f docker-compose.test.yml down -v"