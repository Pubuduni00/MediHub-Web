const jwt    = require('jsonwebtoken');
const config = require('../config/config');

// ── Generate JWT token ──
// payload = { id, email, role, name }
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// ── Verify JWT token ──
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { generateToken, verifyToken };
