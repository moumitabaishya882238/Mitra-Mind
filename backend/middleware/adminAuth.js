// Middleware to check if admin is authenticated
const requireAdmin = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Admin authentication required' 
    });
  }
  next();
};

// Middleware to check if super-admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.session.adminId || req.session.adminRole !== 'super-admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super admin access required' 
    });
  }
  next();
};

module.exports = {
  requireAdmin,
  requireSuperAdmin
};
