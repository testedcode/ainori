const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is required for migration.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
});

async function main() {
  try {
    console.log('Running migration...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_url TEXT;');
    await pool.query('ALTER TABLE corridors ADD COLUMN IF NOT EXISTS description TEXT;');
    await pool.query('ALTER TABLE corridors ADD COLUMN IF NOT EXISTS image_url TEXT;');
    await pool.query('ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;');
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

main();
