const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ============================================
// POST /api/auth/register — Daftar akun baru
// ============================================
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Semua field harus diisi.' });
  }

  if (!['tenant', 'owner'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role harus tenant atau owner.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
  }

  try {
    const db = req.app.locals.db;

    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const result = db.exec('SELECT last_insert_rowid() as id');
    const userId = result[0].values[0][0];

    // Simpan database ke file
    req.app.locals.saveDb();

    const token = jwt.sign(
      { id: userId, name, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// POST /api/auth/login — Login
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password harus diisi.' });
  }

  try {
    const db = req.app.locals.db;

    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const columns = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ============================================
// GET /api/auth/me — Ambil data user dari token
// ============================================
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.exec('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const columns = result[0].columns;
    const row = result[0].values[0];
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    res.json({ success: true, user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
