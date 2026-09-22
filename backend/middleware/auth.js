const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Only the shop owner (Shahim) can add/edit products
const ownerOnly = (req, res, next) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Owner access only' });
  }
  next();
};

module.exports = { protect, ownerOnly };
