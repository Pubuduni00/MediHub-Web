// ── Role-based access control ──
// Usage examples:
//   router.post('/doctors', protect, isStaff, addDoctor)
//   router.post('/logs',    protect, isDoctor, addLog)
//   router.get('/patients', protect, isStaffOrDoctor, getPatients)

// Only staff can access
const isStaff = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied — staff only',
  });
};

// Only doctors can access
const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied — doctors only',
  });
};

// Both staff and doctors can access
const isStaffOrDoctor = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'doctor')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied',
  });
};

module.exports = { isStaff, isDoctor, isStaffOrDoctor };
