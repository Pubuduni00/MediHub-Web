const bcrypt         = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { query }      = require('../config/db');
const { generateToken } = require('../utils/generateToken');
const config         = require('../config/config');

const googleClient = new OAuth2Client(config.googleClientId);

// ══════════════════════════════════════════
//  @route  POST /api/auth/staff/login
//  @desc   Staff login with email & password
//  @access Public
// ══════════════════════════════════════════
const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find staff by email
    const result = await query(
      `SELECT id, employee_id, name, email, password_hash,
              department, phone, role, status
       FROM staff
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const staff = result.rows[0];

    // Check if account is active
    if (staff.status === 'Inactive') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive — contact administration',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, staff.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id:   staff.id,
      email: staff.email,
      role: staff.role,
      name: staff.name,
    });

    // Return user data (no password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:           staff.id,
        employeeId:   staff.employee_id,
        name:         staff.name,
        email:        staff.email,
        department:   staff.department,
        phone:        staff.phone,
        role:         staff.role,
      },
    });

  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};


// ══════════════════════════════════════════
//  @route  POST /api/auth/doctor/google
//  @desc   Doctor login via Google OAuth
//  @access Public
// ══════════════════════════════════════════
const doctorGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    // Verify the Google ID token
    let googlePayload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken:  credential,
        audience: config.googleClientId,
      });
      googlePayload = ticket.getPayload();
    } catch (googleErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token — please try again',
      });
    }

    const { sub, email, name, picture } = googlePayload;

    // Look up doctor by Google sub (most reliable) or email
    let result = await query(
      `SELECT id, employee_id, name, email, google_sub,
              specialty, department, phone, qualification,
              schedule, role, status
       FROM doctors
       WHERE google_sub = $1 OR email = $2
       LIMIT 1`,
      [sub, email.toLowerCase()]
    );

    let doctor;

    if (result.rows.length === 0) {
      // ── Doctor not registered ──
      // In production: reject. For demo: auto-register.
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Your Google account is not registered as a doctor. Contact administration.',
        });
      }

      // DEV ONLY: auto-create doctor from Google profile
      const empId = 'DR' + Date.now().toString().slice(-4);
      const insertResult = await query(
        `INSERT INTO doctors
           (employee_id, name, email, google_sub, specialty, department, role, status)
         VALUES ($1, $2, $3, $4, 'General Medicine', 'General Medicine', 'doctor', 'Active')
         RETURNING id, employee_id, name, email, specialty, department, role, status`,
        [empId, name, email.toLowerCase(), sub]
      );
      doctor = insertResult.rows[0];

    } else {
      doctor = result.rows[0];

      // Update google_sub if not set yet (first time Google login)
      if (!doctor.google_sub) {
        await query(
          'UPDATE doctors SET google_sub = $1 WHERE id = $2',
          [sub, doctor.id]
        );
      }
    }

    // Check account is active
    if (doctor.status === 'Inactive') {
      return res.status(401).json({
        success: false,
        message: 'Doctor account is inactive — contact administration',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id:    doctor.id,
      email: doctor.email,
      role:  doctor.role,
      name:  doctor.name,
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id:           doctor.id,
        employeeId:   doctor.employee_id,
        name:         doctor.name,
        email:        doctor.email,
        specialty:    doctor.specialty,
        department:   doctor.department,
        phone:        doctor.phone,
        qualification: doctor.qualification,
        schedule:     doctor.schedule,
        role:         doctor.role,
        avatar:       picture || null,
      },
    });

  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login',
    });
  }
};


// ══════════════════════════════════════════
//  @route  GET /api/auth/me
//  @desc   Get current logged-in user info
//  @access Protected
// ══════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware protect()
    const { id, role } = req.user;

    let result;
    if (role === 'doctor') {
      result = await query(
        `SELECT id, employee_id, name, email, specialty,
                department, phone, qualification, schedule, role, status
         FROM doctors WHERE id = $1`,
        [id]
      );
    } else {
      result = await query(
        `SELECT id, employee_id, name, email, department, phone, role, status
         FROM staff WHERE id = $1`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0],
    });

  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// ══════════════════════════════════════════
//  @route  POST /api/auth/change-password
//  @desc   Staff change password
//  @access Protected (staff only)
// ══════════════════════════════════════════
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM staff WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const salt        = await bcrypt.genSalt(10);
    const newHash     = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE staff SET password_hash = $1 WHERE id = $2',
      [newHash, id]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = { staffLogin, doctorGoogleLogin, getMe, changePassword };
