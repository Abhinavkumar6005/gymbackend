const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔑 Auth Middleware - Token present:', !!token);
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('📦 Decoded token:', JSON.stringify(decoded, null, 2));
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Admin only middleware
const adminMiddleware = (req, res, next) => {
  console.log('🔐 Admin Middleware - Checking user permissions');
  console.log('📋 req.user:', req.user);
  
  // Check multiple possible locations for role
  const role = req.user?.role || req.user?.type || req.user?.userType;
  
  console.log(`👤 User role detected: ${role}`);
  
  if (role !== 'admin') {
    console.log('❌ Access denied - User is not admin');
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  
  console.log('✅ Admin access granted');
  next();
};

module.exports = { authMiddleware, adminMiddleware };