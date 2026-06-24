const { verifyToken } = require('../utils/generateToken');
const { query }       = require('../config/db');

// ── Protect routes — verify JWT token ──
// Add this to any route that requires login
// Usage: router.get('/patients', protect, getPatients)
const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  // Frontend sends: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);

    // Get user from DB to ensure they still exist and are active
    let userResult;

    if (decoded.role === 'doctor') {
      userResult = await query(
        'SELECT id, employee_id, name, email, specialty, department, role, status FROM doctors WHERE id = $1',
        [decoded.id]
      );
    } else {
      userResult = await query(
        'SELECT id, employee_id, name, email, department, role, status FROM staff WHERE id = $1',
        [decoded.id]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    const user = userResult.rows[0];

    if (user.status === 'Inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive — contact administration',
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired — please log in again',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

module.exports = { protect };
