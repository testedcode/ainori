import { getPool } from './frontend/lib/db.js';

async function checkRides() {
  const pool = getPool();
  try {
    const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@cpoolai.com'");
    if (adminRes.rows.length === 0) {
      console.log("Admin user not found");
      return;
    }
    const adminId = adminRes.rows[0].id;
    console.log(`Checking rides for Admin (ID: ${adminId}) on 2026-05-03`);

    const rides = await pool.query(
      "SELECT id, corridor_id, ride_date, direction, status FROM rides WHERE user_id = $1 AND ride_date = '2026-05-03'",
      [adminId]
    );

    console.log("Existing rides:", rides.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkRides();
