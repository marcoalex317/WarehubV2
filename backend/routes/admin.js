const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rowsToTable } = require('../utils/db');

const router = express.Router();

// GET /api/admin/tables — Semua data dari database
// PENTING: hanya boleh diakses oleh user berrole 'admin'. Sebelumnya
// endpoint ini tidak diproteksi sama sekali sehingga siapa pun bisa
// membuka data seluruh user, gudang, dan booking tanpa login.
router.get('/tables', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.locals.db;

    const users = rowsToTable(db.exec('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id'));
    const warehouses = rowsToTable(db.exec('SELECT id, owner_id, name, location, address, size, price, available, rating, reviews, created_at FROM warehouses ORDER BY id'));
    const bookings = rowsToTable(db.exec(`
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
