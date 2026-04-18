const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let dbUrl = "postgresql://postgres.xmsfwmuqgzigkisjzhaw:Cpool2024%21Secure@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const pool = new Pool({
  connectionString: dbUrl,
});

async function main() {
  try {
    console.log('Running migration...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_url TEXT;');
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

main();
