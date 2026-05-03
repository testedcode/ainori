import { getPool } from './frontend/lib/db.js';

async function checkAdminVehicles() {
  const pool = getPool();
  try {
    const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@cpoolai.com'");
    if (adminRes.rows.length === 0) {
      console.log("Admin user not found");
      return;
    }
    const adminId = adminRes.rows[0].id;
    const vehicles = await pool.query("SELECT id, make, model FROM vehicles WHERE user_id = $1", [adminId]);
    console.log(`Admin (ID: ${adminId}) has ${vehicles.rows.length} vehicles:`, vehicles.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkAdminVehicles();
