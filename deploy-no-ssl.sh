#!/bin/bash

# Exit on error
set -e

# Check if domain name is provided
if [ -z "$1" ]; then
  echo "Please provide a domain name or IP address."
  echo "Usage: $0 example.com"
  echo "Or: $0 123.456.789.012"
  exit 1
fi

DOMAIN=$1

# Create necessary directories
mkdir -p certbot/conf certbot/www

# Stop any running containers
docker-compose -f docker-compose.prod.yml down

# Create .env file for production with MongoDB Atlas
cat > .env <<EOF
DATABASE_URL=mongodb+srv://tukawael452:I2M7aXdZT9oOg0B6@cluster0.udwgvo2.mongodb.net/ecommerce
JWT_SECRET=production_jwt_secret_change_this
NODE_ENV=production
EOF

# Create simple nginx config without SSL
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # For health checks
    location /api/health {
        proxy_pass http://app:5000/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://app:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Handle timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Build and start the application
echo "Building and starting the application..."
docker-compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
echo "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "Waiting for the application to start..."
sleep 10

# Check health
echo "Checking application health..."
curl -s "http://localhost/api/health" || echo "Health check failed, but application might still be starting up"

echo "Deployment complete! Your application should be accessible at:"
echo "http://$DOMAIN"
echo ""
echo "Run the following command to check application logs:"
echo "docker-compose -f docker-compose.prod.yml logs -f app"