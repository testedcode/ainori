import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString, ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined });
  console.log('UPDATING SCHEMA...');

  try {
    const sql = fs.readFileSync('../supabase_schema.sql', 'utf8');
    // Basic multi-statement split (naïve) - better to use psql but if we don't have it...
    // We'll just run it as one block, pg Pool.query supports it sometimes, 
    // but better split by ;
    await pool.query(sql);
    console.log('SCHEMA UPDATED SUCCESSFULLY');
  } catch (err) {
    console.error('ERROR UPDATING SCHEMA:', err);
  } finally {
    await pool.end();
  }
}

main();
