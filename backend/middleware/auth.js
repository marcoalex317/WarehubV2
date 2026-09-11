const jwt = require('jsonwebtoken');

// JWT secret diambil dari environment variable (lihat file .env).
// server.js sudah memanggil dotenv.config() sebelum file ini di-load,
// jadi process.env.JWT_SECRET pasti sudah tersedia saat aplikasi jalan normal.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET belum diset. Salin .env.example menjadi .env lalu isi JWT_SECRET.'
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Format header: "Bearer eyJhbGciOi..."
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Kamu tidak punya akses untuk fitur ini.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
