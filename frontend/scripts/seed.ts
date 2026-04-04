import { getPool } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function seed() {
  const pool = getPool();
  console.log('Seeding database...');
  
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../supabase_schema.sql'), 'utf8');
    
    // Split by non-quoted semicolons for basic parsing
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    for (const query of queries) {
      try {
        await pool.query(query);
      } catch (err: any) {
        // Ignore "already exists" errors during seeding
        if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
          console.error(`Error executing query: ${query.slice(0, 50)}...`);
          console.error(err.message);
        }
      }
    }
    
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
