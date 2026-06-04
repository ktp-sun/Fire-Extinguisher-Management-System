// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('./DB/users.js');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token without expiration check first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user
    const user = await User.findOne({ 
      _id: decoded._id,
      isActive: 'True'
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Determine if token needs extension
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;
    let shouldExtend = false;
    let newToken;

    // Calculate appropriate expiration based on role
    let expiresIn = process.env.JWT_EXPIRES_IN || '4h';
    if (user.role === 'admin' || user.role === 'super_admin') {
      expiresIn = process.env.JWT_ADMIN_EXPIRES_IN || '8h';
    } else if (user.role === 'worker') {
      expiresIn = process.env.JWT_WORKER_EXPIRES_IN || '24h';
    }

    // Convert expiresIn to seconds
    const expiresInSeconds = convertToSeconds(expiresIn);

    // Extend token if it's past half its lifetime
    if (tokenAge > expiresInSeconds / 2) {
      shouldExtend = true;
      newToken = user.generateAuthToken();
    }

    // Verify token expiration (with original expiration)
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // If token is expired but we're extending it, allow continuation
        if (!shouldExtend) {
          return res.status(401).json({ message: 'Token expired' });
        }
      } else {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // Attach user and token to request
    req.token = shouldExtend ? newToken : token;
    req.user = user;
    req.shouldExtendToken = shouldExtend;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Error authenticating' });
  }
};

// Helper function to convert time strings to seconds
function convertToSeconds(timeString) {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1));
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return parseInt(timeString) || 0;
  }
}

const authSuperMember = async (req, res, next) => {
  try {
    // First verify base authentication
    await auth(req, res, () => {});
    
    if (!req.user) return; // auth already handled the response
    
    const allowedRoles = ['Super Member', 'Worker', 'Admin', 'Super Admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Super Member auth error:', error);
    res.status(500).json({ message: 'Error authenticating' });
  }
};

// Auth for Worker, Admin, and Super Admin
const authWorkerAndAdmin = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user) return;
    
    const allowedRoles = ['Worker', 'Admin', 'Super Admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Worker/Admin auth error:', error);
    res.status(500).json({ message: 'Error authenticating' });
  }
};

// Auth for Admin and Super Admin
const authAdmin = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user) return;
    
    const allowedRoles = ['Admin', 'Super Admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Error authenticating' });
  }
};

module.exports = {
  auth,
  authSuperMember,
  authWorkerAndAdmin,
  authAdmin
};