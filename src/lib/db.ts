// src/lib/db.ts

import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

// Required for Next.js edge runtime
neonConfig.fetchConnectionCache = true;

// Extract database URL from environment variable
const connectionString = process.env.DATABASE_URL || "";

// Create a SQL-template tag function
export const sql = neon(connectionString);

// Alternatively, use a connection pool when not using edge runtime
export const pool = new Pool({ connectionString });

// Initialize the database by creating the game_results table if it doesn't exist
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        difficulty VARCHAR(20) NOT NULL,
        rule VARCHAR(20) NOT NULL,
        completion_time FLOAT NOT NULL,
        player_name VARCHAR(100),
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_difficulty_rule ON game_results (difficulty, rule);
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
