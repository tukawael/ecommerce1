// This script will be executed when the MongoDB container is first started
db = db.getSiblingDB('admin');

// Create admin user
db.createUser({
  user: process.env.MONGO_USERNAME,
  pwd: process.env.MONGO_PASSWORD,
  roles: [{ role: 'root', db: 'admin' }]
});

// Switch to the application database
db = db.getSiblingDB('ecommerce');

// Create application user
db.createUser({
  user: process.env.MONGO_USERNAME,
  pwd: process.env.MONGO_PASSWORD,
  roles: [
    { role: 'readWrite', db: 'ecommerce' },
    { role: 'dbAdmin', db: 'ecommerce' }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('cart_items');

// Create indexes (optional)
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "slug": 1 }, { unique: true });