const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function rowToObj(result) {
  if (!result.length || !result[0].values.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
}

// POST /api/bookings — Buat booking baru (tenant only)
router.post('/', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ success: false, message: 'Hanya penyewa yang bisa membuat booking.' });
    }

    const { warehouse_id, start_date, days } = req.body;

    if (!warehouse_id || !start_date || !days) {
      return res.status(400).json({ success: false, message: 'warehouse_id, start_date, dan days wajib diisi.' });
    }

    const db = req.app.locals.db;

    const wResult = db.exec('SELECT * FROM warehouses WHERE id = ?', [warehouse_id]);
    const warehouses = rowToObj(wResult);
    if (warehouses.length === 0) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan.' });
    }

    const w = warehouses[0];
    if (!w.available) {
      return res.status(400).json({ success: false, message: 'Gudang sedang tidak tersedia.' });
    }

    const endDate = new Date(start_date);
    endDate.setDate(endDate.getDate() + parseInt(days));
    const end_date = endDate.toISOString().split('T')[0];

    const total_price = w.price * parseInt(days);

    db.run(
      `INSERT INTO bookings (tenant_id, warehouse_id, start_date, end_date, days, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, warehouse_id, start_date, end_date, parseInt(days), total_price]
    );

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const bookingId = idResult[0].values[0][0];

    req.app.locals.saveDb();

    res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat!',
      booking: {
        id: bookingId,
        warehouse_id,
        start_date,
        end_date,
        days: parseInt(days),
        total_price,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/bookings/my — Daftar booking milik tenant yang login
router.get('/my', authenticateToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.exec(`
      SELECT b.*, w.name as warehouse_name, w.location as warehouse_location, w.image as warehouse_image, w.price as warehouse_price
      FROM bookings b
      JOIN warehouses w ON b.warehouse_id = w.id
      WHERE b.tenant_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    const bookings = rowToObj(result);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/bookings/owner — Daftar booking untuk gudang milik owner yang login
router.get('/owner', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Hanya pemilik gudang yang bisa melihat ini.' });
    }

    const db = req.app.locals.db;
    const result = db.exec(`
      SELECT b.*, w.name as warehouse_name, w.location as warehouse_location, u.name as tenant_name, u.email as tenant_email
      FROM bookings b
      JOIN warehouses w ON b.warehouse_id = w.id
      JOIN users u ON b.tenant_id = u.id
      WHERE w.owner_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);
    const bookings = rowToObj(result);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Owner bookings error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
