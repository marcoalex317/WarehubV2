// =====================
// WAREHUB DEMO MODE
// Dipakai saat web dibuka dari hosting statis (GitHub Pages) yang tidak
// bisa menjalankan backend Node/Express. Semua request ke /api/* dijawab
// dari data contoh yang disimpan di localStorage browser pengunjung,
// dengan bentuk respons yang sama persis seperti backend asli.
//
// Aktif otomatis kalau:
//   - domain berakhiran github.io, atau
//   - file dibuka langsung (file://), atau
//   - URL diberi ?demo=1 (berlaku sampai tab ditutup, matikan dengan ?demo=0)
//
// Wajib dimuat SETELAH auth.js dan SEBELUM main.js.
// =====================

(function () {
  const params = new URLSearchParams(location.search);
  try {
    if (params.get('demo') === '1') sessionStorage.setItem('wh_demo', '1');
    if (params.get('demo') === '0') sessionStorage.removeItem('wh_demo');
  } catch (e) { /* sessionStorage diblokir, abaikan */ }

  let forced = false;
  try { forced = sessionStorage.getItem('wh_demo') === '1'; } catch (e) {}

  const isStatic = location.hostname.endsWith('github.io') || location.protocol === 'file:';
  window.WH_DEMO = isStatic || forced;
  if (!window.WH_DEMO) return;

  const DB_KEY = 'wh_demo_db_v1';
  const TOKEN_PREFIX = 'demo-';
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // ---------- Helper tanggal ----------
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(base, n) { const d = new Date(base); d.setDate(d.getDate() + n); return d; }
  function stamp(d) {
    d = d || new Date();
    return isoDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // ---------- Data awal (sama dengan backend/database/seed.js) ----------
  function buildSeed() {
    const today = new Date();
    const created = stamp(addDays(today, -120));
    const users = [
      { id: 1, name: 'Rina Penyewa', email: 'tenant@warehub.com', role: 'tenant', phone: '081234567890', created_at: created },
      { id: 2, name: 'Budi Pemilik', email: 'owner@warehub.com', role: 'owner', phone: '089876543210', created_at: created },
      { id: 3, name: 'Admin WareHub', email: 'admin@warehub.com', role: 'admin', phone: '', created_at: created },
      { id: 4, name: 'Toko Skincare Ayu', email: 'skincare.ayu@example.com', role: 'tenant', phone: '', created_at: stamp(addDays(today, -40)) },
      { id: 5, name: 'ARTH Wear', email: 'arthwear@example.com', role: 'tenant', phone: '', created_at: stamp(addDays(today, -25)) }
    ];

    const base = [
      ['Gudang Sentral Cakung', 'Jakarta Timur', 'Jl. Raya Cakung Cilincing No.15, Cakung, Jakarta Timur', 120, 75000,
        'Gudang luas di kawasan industri Cakung. Akses langsung ke jalan tol, cocok untuk distribusi dan penyimpanan skala menengah.',
        ['CCTV', 'Keamanan 24 Jam', 'Loading Dock', 'Akses Kendaraan', 'Listrik 24 Jam'], 4.8, 42],
      ['Mini Storage Kelapa Gading', 'Jakarta Utara', 'Jl. Boulevard Raya Blok QE No.3, Kelapa Gading, Jakarta Utara', 18, 35000,
        'Storage mini ideal untuk online seller dan UMKM. Bersih, ber-AC, dan dilengkapi rak penyimpanan. Dekat area perumahan.',
        ['CCTV', 'AC', 'Rak Penyimpanan', 'Listrik 24 Jam'], 4.9, 87],
      ['Cold Storage Pluit', 'Jakarta Utara', 'Jl. Pluit Selatan Raya No.22, Penjaringan, Jakarta Utara', 45, 150000,
        'Gudang berpendingin untuk produk makanan, minuman, dan farmasi. Suhu terjaga 2-8°C. Sertifikasi BPOM ready.',
        ['Pendingin', 'CCTV', 'Keamanan 24 Jam', 'Forklift', 'Loading Dock'], 4.7, 31],
      ['Gudang Tangerang Selatan', 'Tangerang Selatan', 'Jl. Raya Serpong KM.7, Serpong, Tangerang Selatan', 200, 95000,
        'Gudang besar untuk kebutuhan logistik dan warehousing. Dilengkapi area parkir truk dan sistem inventory digital.',
        ['CCTV', 'Keamanan 24 Jam', 'Loading Dock', 'Forklift', 'Akses Kendaraan', 'Listrik 24 Jam'], 4.6, 19],
      ['Shared Warehouse Kemayoran', 'Jakarta Pusat', 'Jl. Benyamin Suaeb No.45, Kemayoran, Jakarta Pusat', 30, 55000,
        'Gudang sharing di kawasan strategis Kemayoran. Fleksibel mulai dari 1 hari. Cocok untuk event, pop-up store, atau transit barang.',
        ['CCTV', 'AC', 'Keamanan 24 Jam', 'Toilet', 'Listrik 24 Jam'], 4.5, 56]
    ];
    const warehouses = base.map((w, i) => ({
      id: i + 1, owner_id: 2, name: w[0], location: w[1], address: w[2], size: w[3], price: w[4],
      description: w[5], image: 'assets/images/gudang-' + (i + 1) + '.jpg', facilities: w[6],
      available: 1, rating: w[7], reviews: w[8], created_at: stamp(addDays(today, -100 + i))
    }));

    function bk(id, tenant, wh, startOffset, days, status) {
      const start = addDays(today, startOffset);
      return {
        id, tenant_id: tenant, warehouse_id: wh, start_date: isoDate(start),
        end_date: isoDate(addDays(start, days)), days,
        total_price: warehouses[wh - 1].price * days, status,
        created_at: stamp(addDays(start, -2))
      };
    }
    const bookings = [
      bk(1, 1, 1, -10, 30, 'active'),
      bk(2, 1, 2, -75, 30, 'done'),
      bk(3, 4, 5, 3, 7, 'pending'),
      bk(4, 5, 2, 5, 14, 'pending')
    ];

    return { users, warehouses, bookings, next: { user: 6, warehouse: 6, booking: 5 } };
  }

  // ---------- Penyimpanan ----------
  function loadDb() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const db = buildSeed();
    saveDb(db);
    return db;
  }
  function saveDb(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      return false; // kuota penuh (biasanya karena foto upload terlalu besar)
    }
  }
  let db = loadDb();

  function publicUser(u) { return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone || '' }; }
  function findUser(id) { return db.users.find(u => u.id === id) || null; }

  // ---------- Sesi demo ----------
  function loginAs(role) {
    const u = db.users.find(x => x.role === role);
    if (!u) return null;
    saveSession(publicUser(u), TOKEN_PREFIX + u.id);
    return u;
  }

  // Bersihkan sesi lama yang bukan dari mode demo (mis. sisa WareHub versi
  // lama di domain yang sama). Sesi setengah jadi seperti ini yang dulu
  // membuat halaman login dan dashboard saling redirect tanpa henti.
  (function cleanSession() {
    const token = localStorage.getItem('wh_token');
    const user = (function () { try { return JSON.parse(localStorage.getItem('wh_user')); } catch (e) { return null; } })();
    const valid = token && token.indexOf(TOKEN_PREFIX) === 0 && user && findUser(Number(token.slice(TOKEN_PREFIX.length)));
    if (!valid && (token || user)) clearSession();
  })();

  // Halaman yang butuh login langsung dibukakan dengan akun demo yang sesuai.
  const PAGE_ROLE = {
    'dashboard-owner.html': 'owner',
    'admin.html': 'admin'
  };
  const TENANT_PAGES = ['booking.html', 'payment.html'];
  if (TENANT_PAGES.includes(page) && !isLoggedIn()) loginAs('tenant');

  window.requireLogin = function () {
    const wanted = PAGE_ROLE[page] || 'tenant';
    if (!isLoggedIn() || (page === 'admin.html' && getCurrentRole() !== 'admin')) loginAs(wanted);
    return true;
  };
  window.requireRole = function (role) {
    if (getCurrentRole() !== role) loginAs(role);
    return true;
  };

  // ---------- Mock API ----------
  function json(status, body) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }
  function readHeader(headers, name) {
    if (!headers) return null;
    if (typeof headers.get === 'function') return headers.get(name);
    const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? headers[key] : null;
  }
  function authUser(init) {
    const h = readHeader(init.headers, 'Authorization') || '';
    const token = h.replace(/^Bearer\s+/i, '') || localStorage.getItem('wh_token') || '';
    if (token.indexOf(TOKEN_PREFIX) !== 0) return null;
    return findUser(Number(token.slice(TOKEN_PREFIX.length)));
  }
  function readBody(body) {
    if (!body) return {};
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      const obj = {};
      body.forEach((v, k) => { obj[k] = v; });
      return obj;
    }
    try { return JSON.parse(body); } catch (e) { return {}; }
  }

  // Foto upload diperkecil dulu supaya muat di localStorage.
  function fileToDataUrl(file) {
    return new Promise(resolve => {
      if (!file || typeof file === 'string' || !file.type || file.type.indexOf('image/') !== 0) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 800;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = () => resolve(null);
        img.src = reader.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  function withOwner(w) {
    const owner = findUser(w.owner_id);
    return Object.assign({}, w, { facilities: (w.facilities || []).slice(), owner_name: owner ? owner.name : '-' });
  }
  function bookingJoin(b) {
    const w = db.warehouses.find(x => x.id === b.warehouse_id) || {};
    const t = findUser(b.tenant_id) || {};
    return Object.assign({}, b, {
      warehouse_name: w.name || '(gudang dihapus)', warehouse_location: w.location || '-',
      warehouse_image: w.image || '', warehouse_price: w.price || 0,
      tenant_name: t.name || '-', tenant_email: t.email || ''
    });
  }
  function parseFacilities(v) {
    if (Array.isArray(v)) return v;
    if (!v) return [];
    try { const a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch (e) {
      return String(v).split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  function table(columns, rows) { return rows.length ? { columns, rows } : { columns: [], rows: [] }; }

  async function handle(method, path, init) {
    const body = readBody(init.body);
    const me = authUser(init);
    let m;

    // --- AUTH ---
    if (method === 'POST' && path === '/auth/login') {
      if (!body.email || !body.password) return json(400, { success: false, message: 'Email dan password harus diisi.' });
      const u = db.users.find(x => x.email.toLowerCase() === String(body.email).toLowerCase());
      if (!u) return json(401, { success: false, message: 'Email belum terdaftar. Pakai akun demo di halaman ini, atau daftar dulu.' });
      return json(200, { success: true, message: 'Login berhasil!', token: TOKEN_PREFIX + u.id, user: publicUser(u) });
    }
    if (method === 'POST' && path === '/auth/register') {
      const { name, email, password, role } = body;
      if (!name || !email || !password || !role) return json(400, { success: false, message: 'Semua field harus diisi.' });
      if (!['tenant', 'owner'].includes(role)) return json(400, { success: false, message: 'Role harus tenant atau owner.' });
      if (String(password).length < 6) return json(400, { success: false, message: 'Password minimal 6 karakter.' });
      if (db.users.some(x => x.email.toLowerCase() === String(email).toLowerCase())) return json(400, { success: false, message: 'Email sudah terdaftar.' });
      const u = { id: db.next.user++, name, email, role, phone: '', created_at: stamp() };
      db.users.push(u); saveDb(db);
      return json(201, { success: true, message: 'Registrasi berhasil!', token: TOKEN_PREFIX + u.id, user: publicUser(u) });
    }
    if (method === 'GET' && path === '/auth/me') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      return json(200, { success: true, user: Object.assign(publicUser(me), { created_at: me.created_at }) });
    }

    // --- WAREHOUSES ---
    if (method === 'GET' && path === '/warehouses') {
      const list = db.warehouses.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).map(withOwner);
      return json(200, { success: true, warehouses: list });
    }
    if (method === 'GET' && path === '/warehouses/owner/me') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'owner') return json(403, { success: false, message: 'Akses ditolak.' });
      return json(200, { success: true, warehouses: db.warehouses.filter(w => w.owner_id === me.id).map(withOwner) });
    }
    if ((m = path.match(/^\/warehouses\/(\d+)$/))) {
      const id = Number(m[1]);
      const w = db.warehouses.find(x => x.id === id);
      if (method === 'GET') {
        if (!w) return json(404, { success: false, message: 'Gudang tidak ditemukan.' });
        return json(200, { success: true, warehouse: withOwner(w) });
      }
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'owner') return json(403, { success: false, message: 'Akses ditolak.' });
      if (!w || w.owner_id !== me.id) return json(404, { success: false, message: 'Gudang tidak ditemukan atau bukan milikmu.' });
      if (method === 'PUT') {
        ['name', 'location', 'address', 'description'].forEach(k => { if (body[k] !== undefined && body[k] !== '') w[k] = body[k]; });
        ['size', 'price'].forEach(k => { if (body[k]) w[k] = Number(body[k]); });
        if (body.available !== undefined) w.available = (body.available === true || body.available === '1' || body.available === 1 || body.available === 'true') ? 1 : 0;
        if (body.facilities !== undefined) w.facilities = parseFacilities(body.facilities);
        const img = await fileToDataUrl(body.image);
        if (img) w.image = img;
        if (!saveDb(db)) { w.image = 'assets/images/gudang-6.jpg'; saveDb(db); }
        return json(200, { success: true, message: 'Gudang berhasil diperbarui!' });
      }
      if (method === 'DELETE') {
        db.warehouses = db.warehouses.filter(x => x.id !== id);
        saveDb(db);
        return json(200, { success: true, message: 'Gudang berhasil dihapus.' });
      }
    }
    if (method === 'POST' && path === '/warehouses') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'owner') return json(403, { success: false, message: 'Akses ditolak.' });
      if (!body.name || !body.location || !body.size || !body.price) return json(400, { success: false, message: 'Nama, lokasi, ukuran, dan harga wajib diisi.' });
      const img = await fileToDataUrl(body.image);
      const w = {
        id: db.next.warehouse++, owner_id: me.id, name: body.name, location: body.location,
        address: body.address || '', size: Number(body.size), price: Number(body.price),
        description: body.description || '', image: img || 'assets/images/gudang-6.jpg',
        facilities: parseFacilities(body.facilities), available: 1, rating: 0, reviews: 0, created_at: stamp()
      };
      db.warehouses.push(w);
      if (!saveDb(db)) { w.image = 'assets/images/gudang-6.jpg'; saveDb(db); }
      return json(201, { success: true, message: 'Gudang berhasil ditambahkan!', warehouse: { id: w.id, name: w.name, location: w.location, image: w.image } });
    }

    // --- BOOKINGS ---
    if (method === 'POST' && path === '/bookings') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'tenant') return json(403, { success: false, message: 'Hanya penyewa yang bisa membuat booking.' });
      const whId = Number(body.warehouse_id), days = Number(body.days);
      if (!whId || !body.start_date || !days) return json(400, { success: false, message: 'warehouse_id, start_date, dan days wajib diisi.' });
      const w = db.warehouses.find(x => x.id === whId);
      if (!w) return json(404, { success: false, message: 'Gudang tidak ditemukan.' });
      if (!w.available) return json(400, { success: false, message: 'Gudang sedang tidak tersedia.' });
      const end = isoDate(addDays(new Date(body.start_date), days));
      const b = { id: db.next.booking++, tenant_id: me.id, warehouse_id: whId, start_date: body.start_date, end_date: end, days, total_price: w.price * days, status: 'pending', created_at: stamp() };
      db.bookings.push(b); saveDb(db);
      return json(201, { success: true, message: 'Booking berhasil dibuat!', booking: { id: b.id, warehouse_id: whId, start_date: b.start_date, end_date: end, days, total_price: b.total_price, status: 'pending' } });
    }
    if (method === 'GET' && path === '/bookings/my') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      const list = db.bookings.filter(b => b.tenant_id === me.id).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(bookingJoin);
      return json(200, { success: true, bookings: list });
    }
    if (method === 'GET' && path === '/bookings/owner') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'owner') return json(403, { success: false, message: 'Hanya pemilik gudang yang bisa melihat ini.' });
      const mine = db.warehouses.filter(w => w.owner_id === me.id).map(w => w.id);
      const list = db.bookings.filter(b => mine.includes(b.warehouse_id)).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(bookingJoin);
      return json(200, { success: true, bookings: list });
    }

    // --- ADMIN ---
    if (method === 'GET' && path === '/admin/tables') {
      if (!me) return json(401, { success: false, message: 'Token tidak valid.' });
      if (me.role !== 'admin') return json(403, { success: false, message: 'Akses ditolak.' });
      const users = table(['id', 'name', 'email', 'role', 'phone', 'created_at'],
        db.users.map(u => [u.id, u.name, u.email, u.role, u.phone || '', u.created_at]));
      const warehouses = table(['id', 'owner_id', 'name', 'location', 'address', 'size', 'price', 'available', 'rating', 'reviews', 'created_at'],
        db.warehouses.map(w => [w.id, w.owner_id, w.name, w.location, w.address, w.size, w.price, w.available, w.rating, w.reviews, w.created_at]));
      const bookings = table(['id', 'tenant_id', 'warehouse_id', 'tenant_name', 'warehouse_name', 'start_date', 'end_date', 'days', 'total_price', 'status', 'created_at'],
        db.bookings.map(bookingJoin).map(b => [b.id, b.tenant_id, b.warehouse_id, b.tenant_name, b.warehouse_name, b.start_date, b.end_date, b.days, b.total_price, b.status, b.created_at]));
      return json(200, {
        success: true, users, warehouses, bookings,
        stats: {
          totalUsers: db.users.length, totalWarehouses: db.warehouses.length, totalBookings: db.bookings.length,
          tenants: db.users.filter(u => u.role === 'tenant').length, owners: db.users.filter(u => u.role === 'owner').length
        }
      });
    }

    return json(404, { success: false, message: 'Endpoint tidak tersedia di mode demo.' });
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const idx = url.indexOf('/api/');
    if (idx === -1) return realFetch(input, init);
    init = init || {};
    const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
    const path = url.slice(idx + 4).split('?')[0].replace(/\/+$/, '') || '/';
    db = loadDb(); // ambil versi terbaru (bisa berubah dari tab lain)
    return new Promise(resolve => setTimeout(resolve, 120)).then(() => handle(method, path, init));
  };

  // ---------- Panel mode demo ----------
  window.whDemoSwitch = function (role) {
    loginAs(role);
    location.href = role === 'tenant' ? 'dashboard-tenant.html' : role === 'owner' ? 'dashboard-owner.html' : 'admin.html';
  };
  window.whDemoReset = function () {
    localStorage.removeItem(DB_KEY);
    clearSession();
    try { sessionStorage.removeItem('wh_demo_min'); } catch (e) {}
    location.href = 'index.html';
  };
  window.whDemoToggle = function (min) {
    try { sessionStorage.setItem('wh_demo_min', min ? '1' : '0'); } catch (e) {}
    const el = document.getElementById('wh-demo');
    if (el) el.classList.toggle('min', min);
  };

  function mountPanel() {
    if (document.getElementById('wh-demo')) return;
    const role = getCurrentRole();
    let minimized = false;
    try {
      const saved = sessionStorage.getItem('wh_demo_min');
      minimized = saved === null ? window.innerWidth < 600 : saved === '1'; // di HP mulai dalam bentuk kecil
    } catch (e) {}

    const style = document.createElement('style');
    style.textContent = `
      #wh-demo{position:fixed;left:16px;bottom:16px;z-index:9999;width:280px;background:#0f172a;color:#fff;
        border-radius:14px;box-shadow:0 12px 32px rgba(15,23,42,.28);font-family:inherit;font-size:13px;line-height:1.45}
      #wh-demo .wd-body{padding:14px 14px 12px}
      #wh-demo .wd-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
      #wh-demo .wd-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.08em}
      #wh-demo .wd-dot{width:7px;height:7px;border-radius:50%;background:#22c55e}
      #wh-demo .wd-x{background:none;border:0;color:rgba(255,255,255,.55);cursor:pointer;font-size:12px;padding:2px 4px}
      #wh-demo .wd-x:hover{color:#fff}
      #wh-demo p{margin:0 0 10px;color:rgba(255,255,255,.72);font-size:12px}
      #wh-demo .wd-roles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
      #wh-demo .wd-roles button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;
        border-radius:8px;padding:7px 4px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit}
      #wh-demo .wd-roles button:hover{background:rgba(255,255,255,.14)}
      #wh-demo .wd-roles button.on{background:#fff;color:#0f172a;border-color:#fff}
      #wh-demo .wd-foot{margin-top:10px;display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.5)}
      #wh-demo .wd-foot button{background:none;border:0;color:rgba(255,255,255,.6);text-decoration:underline;cursor:pointer;font-size:11px;padding:0;font-family:inherit}
      #wh-demo .wd-pill{display:none;border:0;background:none;color:#fff;padding:9px 14px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;letter-spacing:.06em;align-items:center;gap:6px}
      #wh-demo.min{width:auto;border-radius:999px}
      #wh-demo.min .wd-body{display:none}
      #wh-demo.min .wd-pill{display:inline-flex}
      @media (max-width:600px){#wh-demo{left:12px;right:12px;bottom:12px;width:auto}#wh-demo.min{right:auto}}
    `;
    document.head.appendChild(style);

    const box = document.createElement('div');
    box.id = 'wh-demo';
    if (minimized) box.classList.add('min');
    const btn = (r, label) => `<button type="button" class="${role === r ? 'on' : ''}" onclick="whDemoSwitch('${r}')">${label}</button>`;
    box.innerHTML = `
      <button type="button" class="wd-pill" onclick="whDemoToggle(false)"><span class="wd-dot" style="width:7px;height:7px;border-radius:50%;background:#22c55e"></span>MODE DEMO</button>
      <div class="wd-body">
        <div class="wd-head">
          <span class="wd-tag"><span class="wd-dot"></span>MODE DEMO</span>
          <button type="button" class="wd-x" onclick="whDemoToggle(true)" aria-label="Kecilkan panel">Kecilkan</button>
        </div>
        <p>Tidak perlu daftar atau login. Pilih peran untuk langsung melihat dashboard-nya.</p>
        <div class="wd-roles">${btn('tenant', 'Penyewa')}${btn('owner', 'Pemilik')}${btn('admin', 'Admin')}</div>
        <div class="wd-foot"><span>Data contoh, tersimpan di browser ini</span><button type="button" onclick="whDemoReset()">Reset</button></div>
      </div>`;
    document.body.appendChild(box);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPanel);
  else mountPanel();
})();
