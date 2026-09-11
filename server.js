require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const { getDatabase, saveDatabase } = require('./backend/database/setup');
const seed = require('./backend/database/seed');
const authRoutes = require('./backend/routes/auth');
const warehouseRoutes = require('./backend/routes/warehouses');
const bookingRoutes = require('./backend/routes/bookings');
const adminRoutes = require('./backend/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware dasar ---
// cors() = mengizinkan frontend berkomunikasi dengan backend
// express.json() = agar server bisa membaca data JSON dari frontend
app.use(cors());
app.use(express.json());

// --- Serve file frontend (HTML/CSS/JS/gambar) ---
// Ini membuat semua file di folder project bisa diakses lewat browser
// Contoh: http://localhost:3000/index.html akan membuka file index.html
app.use(express.static(path.join(__dirname)));

// --- Serve file upload (foto gudang) ---
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// --- Route API test ---
app.get('/api/hello', (req, res) => {
  res.json({
    success: true,
    message: 'Server WareHub berjalan! Backend siap digunakan.'
  });
});

// --- Route API ---
app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// --- Jalankan server ---
async function startServer() {
  const db = await getDatabase();
  app.locals.db = db;
  app.locals.saveDb = saveDatabase;

  await seed(db);

  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('  WAREHUB BACKEND SERVER');
    console.log(`  Buka di browser: http://localhost:${PORT}`);
    console.log(`  Test API:        http://localhost:${PORT}/api/hello`);
    console.log('='.repeat(50));
  });
}

startServer();
