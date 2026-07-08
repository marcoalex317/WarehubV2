const { getDatabase, saveDatabase } = require('./setup');
const bcrypt = require('bcryptjs');

async function seed(db) {
  const standalone = !db;
  if (!db) db = await getDatabase();

  // Cek apakah sudah ada user demo
  const existing = db.exec("SELECT COUNT(*) as c FROM users WHERE email = 'tenant@warehub.com'");
  if (existing.length && existing[0].values[0][0] > 0) {
    console.log('  Data demo sudah ada. Seed dilewati.');
    return;
  }

  console.log('  Membuat data demo...');

  // Hash password
  const tenantPw = bcrypt.hashSync('tenant123', 10);
  const ownerPw = bcrypt.hashSync('owner123', 10);

  // --- Akun Demo ---
  db.run(
    `INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)`,
    ['Rina Penyewa', 'tenant@warehub.com', tenantPw, 'tenant', '081234567890']
  );
  const tenantId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  db.run(
    `INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)`,
    ['Budi Pemilik', 'owner@warehub.com', ownerPw, 'owner', '089876543210']
  );
  const ownerId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

  console.log(`  Akun tenant: tenant@warehub.com / tenant123`);
  console.log(`  Akun owner:  owner@warehub.com / owner123`);

  // --- Gudang Demo ---
  const demoWarehouses = [
    {
      name: 'Gudang Sentral Cakung',
      location: 'Jakarta Timur',
      address: 'Jl. Raya Cakung Cilincing No.15, Cakung, Jakarta Timur',
      size: 120,
      price: 75000,
      description: 'Gudang luas di kawasan industri Cakung. Akses langsung ke jalan tol, cocok untuk distribusi dan penyimpanan skala menengah.',
      facilities: '["CCTV","Keamanan 24 Jam","Loading Dock","Akses Kendaraan","Listrik 24 Jam"]',
      rating: 4.8,
      reviews: 42
    },
    {
      name: 'Mini Storage Kelapa Gading',
      location: 'Jakarta Utara',
      address: 'Jl. Boulevard Raya Blok QE No.3, Kelapa Gading, Jakarta Utara',
      size: 18,
      price: 35000,
      description: 'Storage mini ideal untuk online seller dan UMKM. Bersih, ber-AC, dan dilengkapi rak penyimpanan. Dekat area perumahan.',
      facilities: '["CCTV","AC","Rak Penyimpanan","Listrik 24 Jam"]',
      rating: 4.9,
      reviews: 87
    },
    {
      name: 'Cold Storage Pluit',
      location: 'Jakarta Utara',
      address: 'Jl. Pluit Selatan Raya No.22, Penjaringan, Jakarta Utara',
      size: 45,
      price: 150000,
      description: 'Gudang berpendingin untuk produk makanan, minuman, dan farmasi. Suhu terjaga 2-8°C. Sertifikasi BPOM ready.',
      facilities: '["Pendingin","CCTV","Keamanan 24 Jam","Forklift","Loading Dock"]',
      rating: 4.7,
      reviews: 31
    },
    {
      name: 'Gudang Tangerang Selatan',
      location: 'Tangerang Selatan',
      address: 'Jl. Raya Serpong KM.7, Serpong, Tangerang Selatan',
      size: 200,
      price: 95000,
      description: 'Gudang besar untuk kebutuhan logistik dan warehousing. Dilengkapi area parkir truk dan sistem inventory digital.',
      facilities: '["CCTV","Keamanan 24 Jam","Loading Dock","Forklift","Akses Kendaraan","Listrik 24 Jam"]',
      rating: 4.6,
      reviews: 19
    },
    {
      name: 'Shared Warehouse Kemayoran',
      location: 'Jakarta Pusat',
      address: 'Jl. Benyamin Suaeb No.45, Kemayoran, Jakarta Pusat',
      size: 30,
      price: 55000,
      description: 'Gudang sharing di kawasan strategis Kemayoran. Fleksibel mulai dari 1 hari. Cocok untuk event, pop-up store, atau transit barang.',
      facilities: '["CCTV","AC","Keamanan 24 Jam","Toilet","Listrik 24 Jam"]',
      rating: 4.5,
      reviews: 56
    }
  ];

  demoWarehouses.forEach((w, i) => {
    const image = 'assets/images/gudang-' + (i + 1) + '.jpg';
    db.run(
      `INSERT INTO warehouses (owner_id, name, location, address, size, price, description, image, facilities, available, rating, reviews)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [ownerId, w.name, w.location, w.address, w.size, w.price, w.description, image, w.facilities, w.rating, w.reviews]
    );
  });

  console.log(`  ${demoWarehouses.length} gudang demo ditambahkan.`);

  // --- Booking Demo ---
  const firstWarehouse = db.exec('SELECT id FROM warehouses ORDER BY id LIMIT 1');
  const firstWhId = firstWarehouse[0].values[0][0];
  db.run(
    `INSERT INTO bookings (tenant_id, warehouse_id, start_date, end_date, days, total_price, status)
     VALUES (?, ?, '2026-07-10', '2026-08-09', 30, ?, 'active')`,
    [tenantId, firstWhId, demoWarehouses[0].price * 30]
  );

  console.log('  1 booking demo ditambahkan.');

  saveDatabase();
  console.log('  Seed selesai!');

  if (standalone) process.exit(0);
}

// Bisa dijalankan langsung: node seed.js
// Atau di-import: require('./seed')
if (require.main === module) {
  seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
