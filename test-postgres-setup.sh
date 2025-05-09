#!/bin/bash

# Exit on error
set -e

echo "Testing PostgreSQL Docker setup locally..."

# Ensure .env file exists
if [ ! -f .env ]; then
  echo "Creating sample .env file for testing..."
  cat > .env << EOF
# PostgreSQL Credentials for testing
PGUSER=testuser
PGPASSWORD=testpass
PGDATABASE=testdb
PGHOST=postgres
PGPORT=5432
DATABASE_URL=postgres://testuser:testpass@postgres:5432/testdb

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
      - PGUSER=\${PGUSER}
      - PGPASSWORD=\${PGPASSWORD}
      - PGDATABASE=\${PGDATABASE}
      - PGHOST=\${PGHOST}
      - PGPORT=\${PGPORT}
    networks:
      - app-network
    depends_on:
      - postgres
  
  # PostgreSQL service
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=\${PGUSER}
      - POSTGRES_PASSWORD=\${PGPASSWORD}
      - POSTGRES_DB=\${PGDATABASE}
    volumes:
      - postgres-test-data:/var/lib/postgresql/data
    networks:
      - app-network
    ports:
      - "5432:5432"

networks:
  app-network:
    driver: bridge

volumes:
  postgres-test-data:
    driver: local
EOF

echo "Starting test environment..."
docker-compose -f docker-compose.test.yml up -d

echo "Waiting for services to start..."
sleep 10

echo "Checking application container logs..."
docker-compose -f docker-compose.test.yml logs app

echo "Checking database connection..."
docker-compose -f docker-compose.test.yml exec postgres pg_isready -U "$PGUSER" -d "$PGDATABASE"

if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL connection successful!"
else
  echo "❌ PostgreSQL connection failed."
  exit 1
fi

echo "Testing database migrations..."
docker-compose -f docker-compose.test.yml exec app npm run db:push

echo "Simulation completed successfully."
echo "To clean up test environment, run:"
echo "docker-compose -f docker-compose.test.yml down -v"