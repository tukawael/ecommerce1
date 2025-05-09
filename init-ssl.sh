#!/bin/bash

# Exit on error
set -e

# Check if domain name is provided
if [ -z "$1" ]; then
  echo "Please provide a domain name."
  echo "Usage: $0 example.com"
  exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

# Create folders for certbot
mkdir -p certbot/conf certbot/www

# Stop any running containers
docker-compose -f docker-compose.prod.yml down

# Update nginx.conf with the domain name
sed -i "s/your-domain.com/$DOMAIN/g" nginx.conf
sed -i "s/www.your-domain.com/www.$DOMAIN/g" nginx.conf

# Start nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# Generate SSL certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email --force-renewal -d $DOMAIN -d www.$DOMAIN

# Update nginx.conf to use SSL
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
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
    }
}
EOF

# Restart nginx to use the new configuration
docker-compose -f docker-compose.prod.yml restart nginx

# Start all containers
docker-compose -f docker-compose.prod.yml up -d

echo "SSL certificate has been set up for $DOMAIN"
echo "Your application should now be accessible at https://$DOMAIN"