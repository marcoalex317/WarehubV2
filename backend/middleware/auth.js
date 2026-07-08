const jwt = require('jsonwebtoken');

const JWT_SECRET = 'warehub-secret-key-ganti-di-production';

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
