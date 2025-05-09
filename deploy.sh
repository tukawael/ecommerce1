#!/bin/bash

# Exit on error
set -e

# Install Docker if not installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Installing Docker...'
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo 'Please log out and log back in to use Docker without sudo.'
  exit 1
fi

# Install Docker Compose if not installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Installing Docker Compose...'
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo 'Creating .env file...'
  echo 'DATABASE_URL=mongodb+srv://tukawael452:I2M7aXdZT9oOg0B6@cluster0.udwgvo2.mongodb.net/ecommerce' > .env
  echo 'JWT_SECRET=your_jwt_secret' >> .env
  echo 'NODE_ENV=production' >> .env
  echo 'Please update the JWT_SECRET in the .env file for better security.'
fi

# Build and start the application
echo 'Building and starting the application...'
docker-compose -f docker-compose.prod.yml up -d --build

# Check if services are running
echo 'Checking if services are running...'
docker-compose -f docker-compose.prod.yml ps

echo 'Deployment complete!'
echo 'Your application should now be running at http://your-domain.com'