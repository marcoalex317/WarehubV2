const express = require('express');
const router = express.Router();

function rowToObj(result) {
  if (!result.length || !result[0].values.length) return { columns: [], rows: [] };
  return { columns: result[0].columns, rows: result[0].values };
}

// GET /api/admin/tables — Semua data dari database
router.get('/tables', (req, res) => {
  try {
    const db = req.app.locals.db;

    const users = rowToObj(db.exec('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id'));
    const warehouses = rowToObj(db.exec('SELECT id, owner_id, name, location, address, size, price, available, rating, reviews, created_at FROM warehouses ORDER BY id'));
    const bookings = rowToObj(db.exec(`
      SELECT b.id, b.tenant_id, b.warehouse_id, u.name as tenant_name, w.name as warehouse_name,
             b.start_date, b.end_date, b.days, b.total_price, b.status, b.created_at
      FROM bookings b
      JOIN users u ON b.tenant_id = u.id
      JOIN warehouses w ON b.warehouse_id = w.id
      ORDER BY b.id
    `));

    const stats = {
      totalUsers: db.exec('SELECT COUNT(*) FROM users')[0].values[0][0],
      totalWarehouses: db.exec('SELECT COUNT(*) FROM warehouses')[0].values[0][0],
      totalBookings: db.exec('SELECT COUNT(*) FROM bookings')[0].values[0][0],
      tenants: db.exec("SELECT COUNT(*) FROM users WHERE role='tenant'")[0].values[0][0],
      owners: db.exec("SELECT COUNT(*) FROM users WHERE role='owner'")[0].values[0][0],
    };

    res.json({ success: true, users, warehouses, bookings, stats });
  } catch (err) {
    console.error('Admin tables error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.' });
  }
});

module.exports = router;
