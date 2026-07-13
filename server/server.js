require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { dbHelpers, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// â”€â”€ Firebase Admin Initialization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let db_firebase = null;

try {
  const path = require('path');
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
  const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
  db_firebase = getFirestore(firebaseApp);
  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.warn('Firebase Admin not initialized (missing serviceAccountKey.json):', err.message);
  console.warn('Firebase sync will be disabled. Add serviceAccountKey.json to enable it.');
}

// Helper to sync patient data to Firestore
async function syncPatientToFirestore(firebaseUid, data) {
  if (!db_firebase || !firebaseUid) return;
  try {
    await db_firebase.collection('users').doc(firebaseUid).set(data, { merge: true });
    console.log('Synced to Firestore for uid:', firebaseUid);
  } catch (err) {
    console.error('Firestore sync error:', err.message);
  }
}

// Helper to sync medication to Firestore
async function syncMedicationToFirestore(firebaseUid, medId, medData) {
  if (!db_firebase || !firebaseUid) return;
  try {
    await db_firebase
      .collection('users').doc(firebaseUid)
      .collection('medications').doc(medId)
      .set(medData, { merge: true });
    console.log('Medication synced to Firestore:', medId);
  } catch (err) {
    console.error('Medication Firestore sync error:', err.message);
  }
}

// Helper to sync appointment to Firestore
async function syncAppointmentToFirestore(firebaseUid, apptId, apptData) {
  if (!db_firebase || !firebaseUid) return;
  try {
    await db_firebase
      .collection('users').doc(firebaseUid)
      .collection('appointments').doc(apptId)
      .set(apptData, { merge: true });
    console.log('Appointment synced to Firestore:', apptId);
  } catch (err) {
    console.error('Appointment Firestore sync error:', err.message);
  }
}

// â”€â”€ ID Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function generateNextId(tableName, prefix) {
  try {
    const rows = await dbHelpers.all(`SELECT id FROM ${tableName} ORDER BY id DESC`);
    if (rows.length === 0) return `${prefix}001`;
    const matchingIds = rows.map(r => r.id).filter(id => id.startsWith(prefix));
    if (matchingIds.length === 0) return `${prefix}001`;
    const numbers = matchingIds.map(id => {
      const val = parseInt(id.slice(prefix.length), 10);
      return isNaN(val) ? 0 : val;
    });
    const maxNum = Math.max(...numbers);
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  } catch (err) {
    return `${prefix}${Date.now().toString().slice(-3)}`;
  }
}

// â”€â”€ Auth Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Staff Login
app.post('/api/auth/staff-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await dbHelpers.get(
      'SELECT * FROM staff WHERE LOWER(email) = ? AND password = ?',
      [email.toLowerCase(), password]
    );
    if (user) {
      const { password: _, ...userData } = user;
      return res.json(userData);
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Doctor Login (Google OAuth)
app.post('/api/auth/doctor-login', async (req, res) => {
  const { email, name, picture } = req.body;
  if (!email) return res.status(400).json({ error: 'Google email is required' });
  try {
    let doctor = await dbHelpers.get(
      'SELECT * FROM doctors WHERE LOWER(email) = ?',
      [email.toLowerCase()]
    );
    if (!doctor) {
      const id = await generateNextId('doctors', 'DR');
      await dbHelpers.run(
        'INSERT INTO doctors (id, name, email, specialty, department, phone, qualification, joinDate, status, schedule, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name || 'Doctor', email.toLowerCase(), 'General Medicine', 'General Medicine', '', 'MBBS', new Date().toISOString().split('T')[0], 'Active', 'Mon-Fri, 9AM-5PM', 'doctor', picture || null]
      );
      doctor = await dbHelpers.get('SELECT * FROM doctors WHERE id = ?', [id]);
    } else if (picture && doctor.avatar !== picture) {
      await dbHelpers.run('UPDATE doctors SET avatar = ? WHERE id = ?', [picture, doctor.id]);
      doctor.avatar = picture;
    }
    return res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ NEW: Link Firebase UID to Patient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Called by Flutter app after Google Sign-In to link Firebase UID with patient
app.post('/api/auth/link-firebase', async (req, res) => {
  try {
    const { firebase_uid, email } = req.body;
    if (!firebase_uid || !email) {
      return res.status(400).json({ error: 'firebase_uid and email required' });
    }

    // Find patient by email
    const patient = await dbHelpers.get(
      'SELECT * FROM patients WHERE LOWER(email) = ?',
      [email.toLowerCase()]
    );

    if (!patient) {
      // Patient not in PostgreSQL yet â€” still save the UID for when they are added
      return res.status(404).json({
        error: 'Patient not found in system',
        message: 'Ask your hospital admin to register your email in the system'
      });
    }

    // Save firebase_uid to PostgreSQL
    await dbHelpers.run(
      'UPDATE patients SET firebase_uid = ? WHERE id = ?',
      [firebase_uid, patient.id]
    );

    // Sync patient profile to Firestore so mobile app can read it
    await syncPatientToFirestore(firebase_uid, {
      fullName: patient.name,
      email: patient.email,
      phoneNumber: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dob,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      hospitalId: patient.id,
      primaryCondition: patient.primaryCondition || '',
      diagnosis: patient.diagnosis || '',
      allergies: patient.allergies || '',
      privacyAccepted: false,
    });

    console.log(`Linked Firebase UID ${firebase_uid} to patient ${patient.id}`);
    return res.json({ success: true, patientId: patient.id });
  } catch (err) {
    console.error('Link Firebase error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ NEW: Receive Check-In from Mobile App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Flutter app sends check-in data here after submitting daily check-in
app.post('/api/mobile/checkin', async (req, res) => {
  try {
    // Verify secret key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CLOUD_FUNCTION_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firebase_uid, date, symptoms, health_status, notes } = req.body;
    if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid required' });

    // Find patient by firebase_uid
    const patient = await dbHelpers.get(
      'SELECT * FROM patients WHERE firebase_uid = ?',
      [firebase_uid]
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Save to symptom_logs table
    const id = await generateNextId('symptom_logs', 'SL');
    const dateStr = date ? new Date(date).toISOString() : new Date().toISOString();
    const symptomsArray = Array.isArray(symptoms) ? symptoms : [];
    const severity = health_status === 'critical' ? 'Severe'
                   : health_status === 'warning' ? 'Moderate' : 'Mild';

    await dbHelpers.run(
      'INSERT INTO symptom_logs (id, patientId, patientName, date, symptoms, severity, notes, reportedVia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patient.id, patient.name, dateStr, JSON.stringify(symptomsArray), severity, notes || '', 'MediHub App']
    );

    // Auto-create alert if critical
    if (health_status === 'critical') {
      const alertId = await generateNextId('alerts', 'AL');
      await dbHelpers.run(
        'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        [alertId, patient.id, patient.name, 'Symptom', `CRITICAL: ${patient.name} reported critical health status via app. Symptoms: ${symptomsArray.join(', ')}`, 'danger', dateStr]
      );
      console.log(`Critical alert created for patient ${patient.name}`);
    } else if (health_status === 'warning' && symptomsArray.length > 0) {
      const alertId = await generateNextId('alerts', 'AL');
      await dbHelpers.run(
        'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        [alertId, patient.id, patient.name, 'Symptom', `${patient.name} reported warning symptoms: ${symptomsArray.join(', ')}`, 'warning', dateStr]
      );
    }

    return res.status(201).json({ success: true, id });
  } catch (err) {
    console.error('Check-in receive error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ NEW: Receive Reschedule Request from Mobile App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/mobile/reschedule-request', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CLOUD_FUNCTION_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firebase_uid, appointment_id, note } = req.body;
    if (!firebase_uid || !appointment_id) {
      return res.status(400).json({ error: 'firebase_uid and appointment_id required' });
    }

    const patient = await dbHelpers.get(
      'SELECT * FROM patients WHERE firebase_uid = ?', [firebase_uid]
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Create alert for doctor
    const alertId = await generateNextId('alerts', 'AL');
    await dbHelpers.run(
      'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      [alertId, patient.id, patient.name, 'Reschedule', `${patient.name} requested appointment reschedule. Reason: ${note || 'Not specified'}`, 'warning', new Date().toISOString()]
    );

    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Patients Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await dbHelpers.all('SELECT * FROM patients');
    const assignments = await dbHelpers.all('SELECT * FROM doctor_patients');
    const assignmentsMap = {};
    assignments.forEach(a => {
      if (!assignmentsMap[a.patient_id]) assignmentsMap[a.patient_id] = [];
      assignmentsMap[a.patient_id].push(a.doctor_id);
    });
    const result = patients.map(p => ({
      ...p,
      medicalHistory: p.medicalHistory ? JSON.parse(p.medicalHistory) : null,
      statusHistory: p.statusHistory ? JSON.parse(p.statusHistory) : [],
      assignedDoctors: assignmentsMap[p.id] || []
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const assignments = await dbHelpers.all(
      'SELECT doctor_id FROM doctor_patients WHERE patient_id = ?', [patient.id]
    );
    patient.medicalHistory = patient.medicalHistory ? JSON.parse(patient.medicalHistory) : null;
    patient.statusHistory = patient.statusHistory ? JSON.parse(patient.statusHistory) : [];
    patient.assignedDoctors = assignments.map(a => a.doctor_id);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/patients', async (req, res) => {
  const { name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, primaryCondition, diagnosis, allergies } = req.body;
  if (!name) return res.status(400).json({ error: 'Patient name is required' });
  try {
    const id = await generateNextId('patients', 'PT');
    const registeredDate = new Date().toISOString().split('T')[0];
    await dbHelpers.run(
      `INSERT INTO patients (id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status, primaryCondition, diagnosis, allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, 'Active', primaryCondition, diagnosis, allergies]
    );
    res.status(201).json({ id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status: 'Active', assignedDoctors: [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  const { name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, status, medicalHistory, statusHistory, primaryCondition, diagnosis, allergies } = req.body;
  try {
    const existing = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Patient not found' });

    const medHistoryStr = medicalHistory !== undefined ? (medicalHistory ? JSON.stringify(medicalHistory) : null) : undefined;
    const statusHistoryStr = statusHistory !== undefined ? (statusHistory ? JSON.stringify(statusHistory) : null) : undefined;

    await dbHelpers.run(
      `UPDATE patients SET
        name = COALESCE(?, name), age = COALESCE(?, age), gender = COALESCE(?, gender),
        dob = COALESCE(?, dob), phone = COALESCE(?, phone), email = COALESCE(?, email),
        address = COALESCE(?, address), bloodGroup = COALESCE(?, bloodGroup), nic = COALESCE(?, nic),
        emergencyContact = COALESCE(?, emergencyContact), emergencyName = COALESCE(?, emergencyName),
        status = COALESCE(?, status), medicalHistory = COALESCE(?, medicalHistory),
        statusHistory = COALESCE(?, statusHistory), primaryCondition = COALESCE(?, primaryCondition),
        diagnosis = COALESCE(?, diagnosis), allergies = COALESCE(?, allergies)
       WHERE id = ?`,
      [name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName,
       status, medHistoryStr, statusHistoryStr, primaryCondition, diagnosis, allergies, req.params.id]
    );

    const updated = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    const assignments = await dbHelpers.all('SELECT doctor_id FROM doctor_patients WHERE patient_id = ?', [req.params.id]);
    updated.medicalHistory = updated.medicalHistory ? JSON.parse(updated.medicalHistory) : null;
    updated.statusHistory = updated.statusHistory ? JSON.parse(updated.statusHistory) : [];
    updated.assignedDoctors = assignments.map(a => a.doctor_id);

    // â”€â”€ Sync updated patient profile to Firestore â”€â”€
    if (updated.firebaseUid) {
      await syncPatientToFirestore(updated.firebaseUid, {
        fullName: updated.name,
        phoneNumber: updated.phone,
        address: updated.address,
        dateOfBirth: updated.dob,
        gender: updated.gender,
        bloodGroup: updated.bloodGroup,
        hospitalId: updated.id,
        primaryCondition: updated.primaryCondition || '',
        diagnosis: updated.diagnosis || '',
        allergies: updated.allergies || '',
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/patients/:id/assign-doctor', async (req, res) => {
  const { doctorId } = req.body;
  const patientId = req.params.id;
  if (!doctorId) return res.status(400).json({ error: 'Doctor ID required' });
  try {
    const patient = await dbHelpers.get('SELECT id FROM patients WHERE id = ?', [patientId]);
    const doctor = await dbHelpers.get('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (!patient || !doctor) return res.status(404).json({ error: 'Patient or Doctor not found' });
    const assignment = await dbHelpers.get(
      'SELECT * FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?', [doctorId, patientId]
    );
    if (!assignment) {
      await dbHelpers.run('INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)', [doctorId, patientId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Doctors Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await dbHelpers.all('SELECT * FROM doctors');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/doctors', async (req, res) => {
  const { name, email, specialty, department, phone, qualification, status, schedule } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  try {
    const id = await generateNextId('doctors', 'DR');
    await dbHelpers.run(
      'INSERT INTO doctors (id, name, email, specialty, department, phone, qualification, joinDate, status, schedule, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, specialty, department, phone, qualification, new Date().toISOString().split('T')[0], status || 'Active', schedule, 'doctor', null]
    );
    res.status(201).json({ id, name, email, specialty, department, phone, qualification, status: status || 'Active', schedule, role: 'doctor' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  const { name, email, specialty, department, phone, qualification, status, schedule } = req.body;
  try {
    const existing = await dbHelpers.get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Doctor not found' });

    await dbHelpers.run(
      `UPDATE doctors SET
        name = COALESCE(?, name), email = COALESCE(?, email),
        specialty = COALESCE(?, specialty), department = COALESCE(?, department),
        phone = COALESCE(?, phone), qualification = COALESCE(?, qualification),
        status = COALESCE(?, status), schedule = COALESCE(?, schedule)
       WHERE id = ?`,
      [name, email, specialty, department, phone, qualification, status, schedule, req.params.id]
    );

    const updated = await dbHelpers.get('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Appointments Endpoints ──

app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await dbHelpers.all('SELECT * FROM appointments');
    const parsed = appointments.map(a => ({
      ...a,
      investigations: a.investigations ? JSON.parse(a.investigations) : []
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes } = req.body;
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'patientId, doctorId, date and time required' });
  }
  try {
    const id = await generateNextId('appointments', 'AP');
    const investigationsStr = investigations ? JSON.stringify(investigations) : JSON.stringify([]);

    await dbHelpers.run(
      'INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, patientName, doctorId, doctorName, date, time, type || 'Consultation', status || 'Pending', details, duration || 30, investigationsStr, investigationNotes || null]
    );

    // Assign doctor to patient if not assigned
    const assignment = await dbHelpers.get(
      'SELECT * FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?', [doctorId, patientId]
    );
    if (!assignment) {
      await dbHelpers.run('INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)', [doctorId, patientId]);
    }

    // â”€â”€ Sync appointment to Firestore for mobile app â”€â”€
    const patient = await dbHelpers.get('SELECT firebase_uid FROM patients WHERE id = ?', [patientId]);
    if (patient && patient.firebaseUid) {
      const apptDateTime = new Date(`${date}T${time}`).getTime();
      await syncAppointmentToFirestore(patient.firebaseUid, id, {
        dateTime: apptDateTime,
        clinic: details || type || 'Clinic',
        doctorName: doctorName,
        requestDetails: details || '',
        status: 'upcoming',
        rescheduleStatus: 'none',
        investigations: investigations || [],
        investigationNotes: investigationNotes || null,
      });
    }

    res.status(201).json({ id, patientId, patientName, doctorId, doctorName, date, time, type: type || 'Consultation', status: status || 'Pending', details, duration: duration || 30, investigations: investigations || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const { status, details, date, time, type, duration, investigations, investigationNotes } = req.body;
  try {
    const existing = await dbHelpers.get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    const investigationsStr = investigations ? JSON.stringify(investigations) : undefined;

    await dbHelpers.run(
      `UPDATE appointments SET
        status = COALESCE(?, status), details = COALESCE(?, details),
        date = COALESCE(?, date), time = COALESCE(?, time),
        type = COALESCE(?, type), duration = COALESCE(?, duration),
        investigations = COALESCE(?, investigations),
        investigationNotes = COALESCE(?, investigationNotes)
       WHERE id = ?`,
      [status, details, date, time, type, duration, investigationsStr, investigationNotes, req.params.id]
    );

    const updated = await dbHelpers.get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);

    // Sync updated appointment to Firestore
    const patient = await dbHelpers.get('SELECT firebase_uid FROM patients WHERE id = ?', [updated.patientId]);
    if (patient && patient.firebaseUid) {
      const updateDate = updated.date || existing.date;
      const updateTime = updated.time || existing.time;
      const apptDateTime = new Date(`${updateDate}T${updateTime}`).getTime();
      await syncAppointmentToFirestore(patient.firebaseUid, req.params.id, {
        dateTime: apptDateTime,
        status: (updated.status || '').toLowerCase() === 'confirmed' ? 'upcoming'
               : (updated.status || '').toLowerCase() === 'completed' ? 'completed'
               : (updated.status || '').toLowerCase() === 'cancelled' ? 'missed'
               : 'upcoming',
        investigations: investigations || (existing.investigations ? JSON.parse(existing.investigations) : []),
        investigationNotes: investigationNotes || existing.investigationNotes || null,
      });
    }

    updated.investigations = updated.investigations ? JSON.parse(updated.investigations) : [];
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Patient Logs Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/patient-logs', async (req, res) => {
  try {
    const logs = await dbHelpers.all('SELECT * FROM patient_logs');
    const parsedLogs = logs.map(l => ({
      ...l,
      examination: JSON.parse(l.examination),
      drugs: JSON.parse(l.drugs),
      investigations: JSON.parse(l.investigations)
    }));
    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/patient-logs', async (req, res) => {
  const { patientId, doctorId, doctorName, examination, drugs, investigations } = req.body;
  if (!patientId || !doctorId) return res.status(400).json({ error: 'patientId and doctorId required' });
  try {
    const id = await generateNextId('patient_logs', 'LOG');
    const date = new Date().toISOString().split('T')[0];
    const examStr = JSON.stringify(examination || {});
    const drugsStr = JSON.stringify(drugs || []);
    const invStr = JSON.stringify(investigations || []);

    await dbHelpers.run(
      'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr]
    );

    // â”€â”€ Sync medications to Firestore when doctor adds drugs in log â”€â”€
    if (drugs && drugs.length > 0) {
      const patient = await dbHelpers.get('SELECT firebase_uid FROM patients WHERE id = ?', [patientId]);
      if (patient && patient.firebaseUid) {
        for (const drug of drugs) {
          const medId = `${id}_${drug.drug.replace(/\s+/g, '_')}`;
          const now = Date.now();
          // Build scheduled times based on frequency
          const scheduledTimes = buildScheduledTimes(drug.frequency || 'Once daily');
          await syncMedicationToFirestore(patient.firebaseUid, medId, {
            name: drug.drug,
            dosage: drug.dose || '',
            frequency: drug.frequency || 'Once daily',
            scheduledTimes: scheduledTimes,
            instructions: `${drug.mealInstruction || ''} ${drug.notes || ''}`.trim(),
            prescribedBy: doctorName,
            startDate: now,
            endDate: null,
            takenStatus: {},
          });
        }
        console.log(`Synced ${drugs.length} medications to Firestore for patient ${patientId}`);
      }
    }

    res.status(201).json({ id, patientId, doctorId, doctorName, date, examination: examination || {}, drugs: drugs || [], investigations: investigations || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper: build scheduled times from frequency string
function buildScheduledTimes(frequency) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const freq = frequency.toLowerCase();
  if (freq.includes('twice') || freq.includes('two') || freq.includes('bd') || freq.includes('2')) {
    return [
      new Date(year, month, day, 8, 0).getTime(),
      new Date(year, month, day, 20, 0).getTime(),
    ];
  } else if (freq.includes('three') || freq.includes('tds') || freq.includes('3')) {
    return [
      new Date(year, month, day, 8, 0).getTime(),
      new Date(year, month, day, 14, 0).getTime(),
      new Date(year, month, day, 20, 0).getTime(),
    ];
  } else if (freq.includes('four') || freq.includes('qds') || freq.includes('4')) {
    return [
      new Date(year, month, day, 8, 0).getTime(),
      new Date(year, month, day, 12, 0).getTime(),
      new Date(year, month, day, 16, 0).getTime(),
      new Date(year, month, day, 20, 0).getTime(),
    ];
  } else {
    // Default: once daily at 8 AM
    return [new Date(year, month, day, 8, 0).getTime()];
  }
}

// â”€â”€ Prescriptions Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/prescriptions', async (req, res) => {
  try {
    const prescriptions = await dbHelpers.all('SELECT * FROM prescriptions');
    const parsed = prescriptions.map(p => ({ ...p, drugs: JSON.parse(p.drugs) }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  const { patientId, logId, addedBy, drugs } = req.body;
  if (!patientId || !drugs) return res.status(400).json({ error: 'patientId and drugs required' });
  try {
    const id = await generateNextId('prescriptions', 'RX');
    const date = new Date().toISOString().split('T')[0];
    await dbHelpers.run(
      'INSERT INTO prescriptions (id, patientId, logId, addedBy, date, drugs) VALUES (?, ?, ?, ?, ?, ?)',
      [id, patientId, logId || null, addedBy, date, JSON.stringify(drugs)]
    );
    res.status(201).json({ id, patientId, logId, addedBy, date, drugs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Alerts Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await dbHelpers.all('SELECT * FROM alerts');
    res.json(alerts.map(a => ({ ...a, read: a.read === 1 })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/alerts/:id/read', async (req, res) => {
  try {
    await dbHelpers.run('UPDATE alerts SET read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/alerts/read-all', async (req, res) => {
  try {
    await dbHelpers.run('UPDATE alerts SET read = 1');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/alerts', async (req, res) => {
  const { patientId, patientName, type, message, severity } = req.body;
  try {
    const id = await generateNextId('alerts', 'AL');
    const date = new Date().toISOString();
    await dbHelpers.run(
      'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
      [id, patientId, patientName, type, message, severity, date]
    );
    res.status(201).json({ id, patientId, patientName, type, message, severity, date, read: false });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Symptom Logs Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/api/symptom-logs', async (req, res) => {
  try {
    const logs = await dbHelpers.all('SELECT * FROM symptom_logs');
    res.json(logs.map(l => ({ ...l, symptoms: JSON.parse(l.symptoms) })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/symptom-logs', async (req, res) => {
  const { patientId, patientName, date, symptoms, severity, notes, reportedVia } = req.body;
  if (!patientId || !patientName || !symptoms) return res.status(400).json({ error: 'patientId, patientName and symptoms required' });
  try {
    const id = await generateNextId('symptom_logs', 'SL');
    const dateStr = date || new Date().toISOString();
    await dbHelpers.run(
      'INSERT INTO symptom_logs (id, patientId, patientName, date, symptoms, severity, notes, reportedVia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, patientName, dateStr, JSON.stringify(symptoms), severity, notes, reportedVia || 'App']
    );
    if (severity === 'Severe') {
      const alertId = await generateNextId('alerts', 'AL');
      await dbHelpers.run(
        'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        [alertId, patientId, patientName, 'Symptom', `Patient reported severe symptoms: ${symptoms.join(', ')}`, 'danger', dateStr]
      );
    }
    res.status(201).json({ id, patientId, patientName, date: dateStr, symptoms, severity, notes, reportedVia: reportedVia || 'App' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// â”€â”€ Manual Sync: Force sync ALL patient data to Firestore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Call this from web portal after updating patient details or adding appointments
app.post('/api/sync/patient/:id', async (req, res) => {
  try {
    const patient = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!patient.firebaseUid) return res.status(400).json({ error: 'Patient has no Firebase UID - they must log in to mobile first' });

    // Sync profile
    await syncPatientToFirestore(patient.firebaseUid, {
      fullName: patient.name,
      email: patient.email,
      phoneNumber: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dob,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      hospitalId: patient.id,
      primaryCondition: patient.primaryCondition || '',
      diagnosis: patient.diagnosis || '',
      allergies: patient.allergies || '',
    });

    // Sync all appointments for this patient
    const appointments = await dbHelpers.all('SELECT * FROM appointments WHERE patientId = ?', [patient.id]);
    for (const appt of appointments) {
      const apptDateTime = new Date(`${appt.date}T${appt.time}`).getTime();
      const investigations = appt.investigations ? JSON.parse(appt.investigations) : [];
      await syncAppointmentToFirestore(patient.firebaseUid, appt.id, {
        dateTime: apptDateTime,
        clinic: appt.details || appt.type || 'Clinic',
        doctorName: appt.doctorName,
        requestDetails: appt.details || '',
        status: appt.status === 'Confirmed' ? 'upcoming'
               : appt.status === 'Completed' ? 'completed'
               : appt.status === 'Cancelled' ? 'missed'
               : 'upcoming',
        rescheduleStatus: 'none',
        investigations: investigations,
        investigationNotes: appt.investigationNotes || null,
      });
    }

    // Sync medications from patient logs (drugs)
    const logs = await dbHelpers.all('SELECT * FROM patient_logs WHERE patientId = ?', [patient.id]);
    for (const log of logs) {
      const drugs = log.drugs ? JSON.parse(log.drugs) : [];
      for (const drug of drugs) {
        const medId = `${log.id}_${drug.drug.replace(/\s+/g, '_')}`;
        const scheduledTimes = buildScheduledTimes(drug.frequency || 'Once daily');
        await syncMedicationToFirestore(patient.firebaseUid, medId, {
          name: drug.drug,
          dosage: drug.dose || '',
          frequency: drug.frequency || 'Once daily',
          scheduledTimes: scheduledTimes,
          instructions: `${drug.mealInstruction || ''} ${drug.notes || ''}`.trim(),
          prescribedBy: log.doctorName,
          startDate: new Date(log.date).getTime(),
          endDate: null,
          takenStatus: {},
        });
      }
    }

    console.log(`Full sync completed for patient ${patient.id} (${patient.name})`);
    res.json({
      success: true,
      patientId: patient.id,
      appointmentsSynced: appointments.length,
      logsSynced: logs.length,
    });
  } catch (err) {
    console.error('Manual sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ Auto-sync when appointment is created (existing POST /api/appointments already does this) â”€â”€
// â”€â”€ This endpoint lets you manually trigger sync for all patients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/sync/all', async (req, res) => {
  try {
    const patients = await dbHelpers.all('SELECT * FROM patients WHERE firebase_uid IS NOT NULL');
    const results = [];
    for (const patient of patients) {
      try {
        // Trigger individual sync
        const appts = await dbHelpers.all('SELECT * FROM appointments WHERE patientId = ?', [patient.id]);
        await syncPatientToFirestore(patient.firebaseUid, {
          fullName: patient.name,
          email: patient.email,
          phoneNumber: patient.phone,
          address: patient.address,
          dateOfBirth: patient.dob,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          hospitalId: patient.id,
          primaryCondition: patient.primaryCondition || '',
          diagnosis: patient.diagnosis || '',
          allergies: patient.allergies || '',
        });
        for (const appt of appts) {
          const apptDateTime = new Date(`${appt.date}T${appt.time}`).getTime();
          await syncAppointmentToFirestore(patient.firebaseUid, appt.id, {
            dateTime: apptDateTime,
            clinic: appt.details || appt.type || 'Clinic',
            doctorName: appt.doctorName,
            requestDetails: appt.details || '',
            status: appt.status === 'Confirmed' ? 'upcoming'
                   : appt.status === 'Completed' ? 'completed'
                   : 'upcoming',
            rescheduleStatus: 'none',
            investigations: appt.investigations ? JSON.parse(appt.investigations) : [],
            investigationNotes: appt.investigationNotes || null,
          });
        }
        results.push({ patient: patient.name, status: 'synced', appointments: appts.length });
      } catch (e) {
        results.push({ patient: patient.name, status: 'error', error: e.message });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Receive profile updates from mobile app
app.put('/api/mobile/update-profile', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CLOUD_FUNCTION_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { firebase_uid, dateOfBirth, phoneNumber, emergencyContactName, emergencyContactNumber } = req.body;
    if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid required' });

    const patient = await dbHelpers.get(
      'SELECT * FROM patients WHERE firebase_uid = ?', [firebase_uid]
    );
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    await dbHelpers.run(
      `UPDATE patients SET
        dob = COALESCE(?, dob),
        phone = COALESCE(?, phone),
        emergencyName = COALESCE(?, emergencyName),
        emergencyContact = COALESCE(?, emergencyContact)
       WHERE firebase_uid = ?`,
      [dateOfBirth, phoneNumber, emergencyContactName, emergencyContactNumber, firebase_uid]
    );

    console.log(`Profile updated in PostgreSQL for patient ${patient.name}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Mobile profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// â”€â”€ Start Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MediHub server running on port ${PORT}`);
      console.log(`Firebase sync: ${db_firebase ? 'ENABLED' : 'DISABLED (add serviceAccountKey.json)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
