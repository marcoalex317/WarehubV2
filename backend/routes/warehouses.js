const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// --- Setup Multer untuk upload foto ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file JPG, PNG, atau WebP yang diperbolehkan.'));
    }
  }
});

// Helper: ubah row hasil sql.js jadi object
function rowToObj(result) {
  if (!result.length || !result[0].values.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    if (obj.facilities) {
      try { obj.facilities = JSON.parse(obj.facilities); } catch (e) { obj.facilities = []; }
    }
    return obj;
  });
}

// ============================================
// GET /api/warehouses — Daftar semua gudang
// ============================================
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.exec(`
      SELECT w.*, u.name as owner_name
      FROM warehouses w
      JOIN users u ON w.owner_id = u.id
      ORDER BY w.created_at DESC
    `);
    const warehouses = rowToObj(result);
    res.json({ success: true, warehouses });
  } catch (err) {
    console.error('List warehouses error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// GET /api/warehouses/owner/me — Gudang milik owner yang login
// (harus sebelum /:id agar "me" tidak dianggap sebagai id)
// ============================================
router.get('/owner/me', authenticateToken, requireRole('owner'), (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.exec('SELECT * FROM warehouses WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]);
    const warehouses = rowToObj(result);
    res.json({ success: true, warehouses });
  } catch (err) {
    console.error('My warehouses error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// GET /api/warehouses/:id — Detail satu gudang
// ============================================
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.exec(`
      SELECT w.*, u.name as owner_name
      FROM warehouses w
      JOIN users u ON w.owner_id = u.id
      WHERE w.id = ?
    `, [req.params.id]);
    const warehouses = rowToObj(result);

    if (warehouses.length === 0) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan.' });
    }
    res.json({ success: true, warehouse: warehouses[0] });
  } catch (err) {
    console.error('Get warehouse error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// POST /api/warehouses — Tambah gudang baru (owner only)
// ============================================
router.post('/', authenticateToken, requireRole('owner'), upload.single('image'), (req, res) => {
  try {
    const { name, location, address, size, price, description, facilities } = req.body;

    if (!name || !location || !size || !price) {
      return res.status(400).json({ success: false, message: 'Nama, lokasi, ukuran, dan harga wajib diisi.' });
    }

    const db = req.app.locals.db;
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';
    const facilitiesJson = facilities || '[]';

    db.run(
      `INSERT INTO warehouses (owner_id, name, location, address, size, price, description, image, facilities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, location, address || '', parseInt(size), parseInt(price), description || '', imagePath, facilitiesJson]
    );

    const result = db.exec('SELECT last_insert_rowid() as id');
    const warehouseId = result[0].values[0][0];

    req.app.locals.saveDb();

    res.status(201).json({
      success: true,
      message: 'Gudang berhasil ditambahkan!',
      warehouse: { id: warehouseId, name, location, image: imagePath }
    });
  } catch (err) {
    console.error('Create warehouse error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// PUT /api/warehouses/:id — Edit gudang (owner only)
// ============================================
router.put('/:id', authenticateToken, requireRole('owner'), upload.single('image'), (req, res) => {
  try {
    const db = req.app.locals.db;

    const existing = db.exec('SELECT * FROM warehouses WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan atau bukan milikmu.' });
    }

    const { name, location, address, size, price, description, facilities, available } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null;

    let query = `UPDATE warehouses SET
      name = COALESCE(?, name),
      location = COALESCE(?, location),
      address = COALESCE(?, address),
      size = COALESCE(?, size),
      price = COALESCE(?, price),
      description = COALESCE(?, description),
      facilities = COALESCE(?, facilities),
      available = COALESCE(?, available)`;
    const params = [
      name || null, location || null, address || null,
      size ? parseInt(size) : null, price ? parseInt(price) : null,
      description || null, facilities || null,
      available !== undefined ? parseInt(available) : null
    ];

    if (imagePath) {
      query += ', image = ?';
      params.push(imagePath);
    }

    query += ' WHERE id = ? AND owner_id = ?';
    params.push(req.params.id, req.user.id);

    db.run(query, params);
    req.app.locals.saveDb();

    res.json({ success: true, message: 'Gudang berhasil diperbarui!' });
  } catch (err) {
    console.error('Update warehouse error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// DELETE /api/warehouses/:id — Hapus gudang (owner only)
// ============================================
router.delete('/:id', authenticateToken, requireRole('owner'), (req, res) => {
  try {
    const db = req.app.locals.db;

    const existing = db.exec('SELECT id FROM warehouses WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ success: false, message: 'Gudang tidak ditemukan atau bukan milikmu.' });
    }

    db.run('DELETE FROM warehouses WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    req.app.locals.saveDb();

    res.json({ success: true, message: 'Gudang berhasil dihapus.' });
  } catch (err) {
    console.error('Delete warehouse error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
