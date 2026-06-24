const express = require('express');
const router  = express.Router();

const {
  staffLogin,
  doctorGoogleLogin,
  getMe,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { isStaff } = require('../middleware/roleMiddleware');

// Public
router.post('/staff/login',    staffLogin);
router.post('/doctor/google',  doctorGoogleLogin);

// Protected
router.get('/me',              protect, getMe);
router.post('/change-password',protect, isStaff, changePassword);

module.exports = router;
