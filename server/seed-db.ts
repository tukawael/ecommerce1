import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { 
  users, categories, products,
  type InsertUser, type InsertCategory, type InsertProduct
} from "../shared/schema";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log("Connecting to PostgreSQL database...");
    const connectionString = process.env.DATABASE_URL as string;
    const sql = postgres(connectionString);
    const db = drizzle(sql);

    console.log("Seeding database with sample data...");

    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "$2b$10$XvQAFjafkxqOj6d5KcEZYe1h9kGX0G3JM2g2O5jK5g3XfynC6QN3i", // "password123"
      email: "admin@shopease.com",
      fullName: "Admin User",
      address: "123 Admin St, Admin City, AC 12345"
    };

    // Insert admin user (skip if already exists)
    const existingUser = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (existingUser.length === 0) {
      await db.insert(users).values({...adminUser, isAdmin: true});
      console.log("✓ Admin user created");
    } else {
      console.log("✓ Admin user already exists");
    }

    // Define sample categories
    const sampleCategories: InsertCategory[] = [
      { name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9" },
      { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5" },
      { name: "Home & Living", slug: "home-living", imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6" },
      { name: "Beauty", slug: "beauty", imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b" }
    ];
    
    // Insert categories (skip if already exists)
    for (const category of sampleCategories) {
      const existingCategory = await db.select().from(categories).where(eq(categories.slug, category.slug)).limit(1);
      if (existingCategory.length === 0) {
        await db.insert(categories).values(category);
        console.log(`✓ Category "${category.name}" created`);
      } else {
        console.log(`✓ Category "${category.name}" already exists`);
      }
    }
    
    // Get category IDs
    const categoryRecords = await db.select().from(categories);
    const categoryMap = new Map(categoryRecords.map(c => [c.slug, c.id]));
    
    // Define sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        stock: 50,
        categoryId: categoryMap.get("electronics"),
        isOnSale: true,
        salePrice: 59.99,
        isNew: false
      },
      {
        name: "Smart Watch",
        slug: "smart-watch",
        description: "Advanced smartwatch with health tracking features",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        stock: 30,
        categoryId: categoryMap.get("electronics"),
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Smartphone Pro",
        slug: "smartphone-pro",
        description: "Latest smartphone with advanced camera and long battery life",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
        stock: 20,
        categoryId: categoryMap.get("electronics"),
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Wireless Earbuds",
        slug: "wireless-earbuds",
        description: "Comfortable wireless earbuds with crystal clear sound",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689",
        stock: 100,
        categoryId: categoryMap.get("electronics"),
        isOnSale: false,
        salePrice: null,
        isNew: true
      },
      {
        name: "Red Sneakers",
        slug: "red-sneakers",
        description: "Stylish and comfortable red sneakers for everyday wear",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        stock: 45,
        categoryId: categoryMap.get("fashion"),
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Digital Camera",
        slug: "digital-camera",
        description: "Professional digital camera with high resolution sensor",
        price: 599.99,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
        stock: 15,
        categoryId: categoryMap.get("electronics"),
        isOnSale: true,
        salePrice: 499.99,
        isNew: false
      },
      {
        name: "Laptop Pro",
        slug: "laptop-pro",
        description: "Powerful laptop for professionals and creators",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        stock: 10,
        categoryId: categoryMap.get("electronics"),
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Travel Backpack",
        slug: "travel-backpack",
        description: "Durable backpack with multiple compartments for travel",
        price: 99.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        stock: 60,
        categoryId: categoryMap.get("fashion"),
        isOnSale: true,
        salePrice: 79.99,
        isNew: false
      }
    ];
    
    // Insert products (skip if already exists)
    for (const product of sampleProducts) {
      const existingProduct = await db.select().from(products).where(eq(products.slug, product.slug)).limit(1);
      if (existingProduct.length === 0) {
        await db.insert(products).values({
          ...product,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 200) + 1
        });
        console.log(`✓ Product "${product.name}" created`);
      } else {
        console.log(`✓ Product "${product.name}" already exists`);
      }
    }

    console.log("Database seeding completed successfully");
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();