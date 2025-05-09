import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log("Connecting to PostgreSQL database...");
    const connectionString = process.env.DATABASE_URL as string;
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql);

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigration();