require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbHelpers, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to generate next sequential ID (robust against deletion)
async function generateNextId(tableName, prefix) {
  try {
    const rows = await dbHelpers.all(`SELECT id FROM ${tableName} ORDER BY id DESC`);
    if (rows.length === 0) {
      return `${prefix}001`;
    }
    // Filter ids matching the prefix
    const matchingIds = rows
      .map(r => r.id)
      .filter(id => id.startsWith(prefix));
    
    if (matchingIds.length === 0) {
      return `${prefix}001`;
    }
    
    // Sort and find max number
    const numbers = matchingIds.map(id => {
      const numStr = id.slice(prefix.length);
      const val = parseInt(numStr, 10);
      return isNaN(val) ? 0 : val;
    });
    
    const maxNum = Math.max(...numbers);
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  } catch (err) {
    console.error(`Error generating ID for ${tableName}:`, err);
    // Fallback simple timestamp/random if it fails
    return `${prefix}${Date.now().toString().slice(-3)}`;
  }
}

// ── Auth Endpoints ──

// Staff Login
app.post('/api/auth/staff-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const user = await dbHelpers.get(
      'SELECT * FROM staff WHERE LOWER(email) = ? AND password = ?',
      [email.toLowerCase(), password]
    );
    
    if (user) {
      // Don't return password
      const { password: _, ...userData } = user;
      return res.json(userData);
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Doctor Login (Google OAuth)
app.post('/api/auth/doctor-login', async (req, res) => {
  const { email, name, picture } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Google email is required' });
  }
  
  try {
    let doctor = await dbHelpers.get(
      'SELECT * FROM doctors WHERE LOWER(email) = ?',
      [email.toLowerCase()]
    );
    
    if (!doctor) {
      // Demo Fallback / Dynamic Registration:
      // If doctor is not in db, register them as a new doctor to persist details.
      const id = await generateNextId('doctors', 'DR');
      const newDoctor = [
        id,
        name || 'Demo Doctor',
        email.toLowerCase(),
        'General Medicine',
        'General Medicine',
        '', // phone
        'MBBS',
        new Date().toISOString().split('T')[0],
        'Active',
        'Mon-Fri, 9AM-5PM',
        'doctor',
        picture || null
      ];
      
      await dbHelpers.run(
        'INSERT INTO doctors (id, name, email, specialty, department, phone, qualification, joinDate, status, schedule, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        newDoctor
      );
      
      doctor = await dbHelpers.get('SELECT * FROM doctors WHERE id = ?', [id]);
    } else {
      // Update avatar if provided
      if (picture && doctor.avatar !== picture) {
        await dbHelpers.run('UPDATE doctors SET avatar = ? WHERE id = ?', [picture, doctor.id]);
        doctor.avatar = picture;
      }
    }
    
    return res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Patients Endpoints ──

// Get all patients (with assigned doctors list)
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await dbHelpers.all('SELECT * FROM patients');
    const assignments = await dbHelpers.all('SELECT * FROM doctor_patients');
    
    // Group assignments by patient_id
    const assignmentsMap = {};
    assignments.forEach(a => {
      if (!assignmentsMap[a.patient_id]) {
        assignmentsMap[a.patient_id] = [];
      }
      assignmentsMap[a.patient_id].push(a.doctor_id);
    });
    
    // Attach assignedDoctors to each patient
    const result = patients.map(p => ({
      ...p,
      medicalHistory: p.medicalHistory ? JSON.parse(p.medicalHistory) : null,
      statusHistory: p.statusHistory ? JSON.parse(p.statusHistory) : [],
      assignedDoctors: assignmentsMap[p.id] || []
    }));
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single patient
app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const assignments = await dbHelpers.all(
      'SELECT doctor_id FROM doctor_patients WHERE patient_id = ?',
      [patient.id]
    );
    
    patient.medicalHistory = patient.medicalHistory ? JSON.parse(patient.medicalHistory) : null;
    patient.statusHistory = patient.statusHistory ? JSON.parse(patient.statusHistory) : [];
    patient.assignedDoctors = assignments.map(a => a.doctor_id);
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register patient
app.post('/api/patients', async (req, res) => {
  const { name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Patient name is required' });
  }
  
  try {
    const id = await generateNextId('patients', 'PT');
    const registeredDate = new Date().toISOString().split('T')[0];
    const status = 'Active';
    
    await dbHelpers.run(
      `INSERT INTO patients (id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status]
    );
    
    const newPatient = {
      id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status,
      assignedDoctors: []
    };
    
    res.status(201).json(newPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  const { name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, status, medicalHistory, statusHistory } = req.body;
  
  try {
    const existing = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const medHistoryStr = medicalHistory !== undefined ? (medicalHistory ? JSON.stringify(medicalHistory) : null) : undefined;
    const statusHistoryStr = statusHistory !== undefined ? (statusHistory ? JSON.stringify(statusHistory) : null) : undefined;
    
    await dbHelpers.run(
      `UPDATE patients SET 
        name = COALESCE(?, name),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        dob = COALESCE(?, dob),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        bloodGroup = COALESCE(?, bloodGroup),
        nic = COALESCE(?, nic),
        emergencyContact = COALESCE(?, emergencyContact),
        emergencyName = COALESCE(?, emergencyName),
        status = COALESCE(?, status),
        medicalHistory = COALESCE(?, medicalHistory),
        statusHistory = COALESCE(?, statusHistory)
       WHERE id = ?`,
      [
        name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, status,
        medHistoryStr,
        statusHistoryStr,
        req.params.id
      ]
    );
    
    const updated = await dbHelpers.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    const assignments = await dbHelpers.all(
      'SELECT doctor_id FROM doctor_patients WHERE patient_id = ?',
      [req.params.id]
    );
    updated.medicalHistory = updated.medicalHistory ? JSON.parse(updated.medicalHistory) : null;
    updated.statusHistory = updated.statusHistory ? JSON.parse(updated.statusHistory) : [];
    updated.assignedDoctors = assignments.map(a => a.doctor_id);
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign doctor to patient
app.post('/api/patients/:id/assign-doctor', async (req, res) => {
  const { doctorId } = req.body;
  const patientId = req.params.id;
  
  if (!doctorId) {
    return res.status(400).json({ error: 'Doctor ID is required' });
  }
  
  try {
    const patient = await dbHelpers.get('SELECT id FROM patients WHERE id = ?', [patientId]);
    const doctor = await dbHelpers.get('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    
    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor not found' });
    }
    
    // Check if assignment exists
    const assignment = await dbHelpers.get(
      'SELECT * FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?',
      [doctorId, patientId]
    );
    
    if (!assignment) {
      await dbHelpers.run(
        'INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)',
        [doctorId, patientId]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Doctors Endpoints ──

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await dbHelpers.all('SELECT * FROM doctors');
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add doctor
app.post('/api/doctors', async (req, res) => {
  const { name, email, specialty, department, phone, qualification, status, schedule } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Doctor name and email are required' });
  }
  
  try {
    const id = await generateNextId('doctors', 'DR');
    const joinDate = new Date().toISOString().split('T')[0];
    const role = 'doctor';
    
    await dbHelpers.run(
      `INSERT INTO doctors (id, name, email, specialty, department, phone, qualification, joinDate, status, schedule, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, specialty, department, phone, qualification, joinDate, status || 'Active', schedule, role, null]
    );
    
    const newDoc = {
      id, name, email, specialty, department, phone, qualification, joinDate, status: status || 'Active', schedule, role, avatar: null,
      employeeId: id
    };
    
    res.status(201).json(newDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Appointments Endpoints ──

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await dbHelpers.all('SELECT * FROM appointments');
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  const { patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration } = req.body;
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: 'patientId, doctorId, date and time are required' });
  }
  
  try {
    const id = await generateNextId('appointments', 'AP');
    
    await dbHelpers.run(
      `INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, patientName, doctorId, doctorName, date, time, type || 'Consultation', status || 'Pending', details, duration || 30]
    );
    
    // Automatically make sure this patient is assigned to this doctor
    const assignment = await dbHelpers.get(
      'SELECT * FROM doctor_patients WHERE doctor_id = ? AND patient_id = ?',
      [doctorId, patientId]
    );
    if (!assignment) {
      await dbHelpers.run(
        'INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)',
        [doctorId, patientId]
      );
    }
    
    const newAppt = {
      id, patientId, patientName, doctorId, doctorName, date, time, type: type || 'Consultation', status: status || 'Pending', details, duration: duration || 30
    };
    
    res.status(201).json(newAppt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { status, details, date, time, type, duration } = req.body;
  try {
    const existing = await dbHelpers.get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    await dbHelpers.run(
      `UPDATE appointments SET
        status = COALESCE(?, status),
        details = COALESCE(?, details),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        type = COALESCE(?, type),
        duration = COALESCE(?, duration)
       WHERE id = ?`,
      [status, details, date, time, type, duration, req.params.id]
    );
    
    const updated = await dbHelpers.get('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Patient Logs Endpoints ──

// Get all logs
app.get('/api/patient-logs', async (req, res) => {
  try {
    const logs = await dbHelpers.all('SELECT * FROM patient_logs');
    
    // Parse JSON columns
    const parsedLogs = logs.map(l => ({
      ...l,
      examination: JSON.parse(l.examination),
      drugs: JSON.parse(l.drugs),
      investigations: JSON.parse(l.investigations)
    }));
    
    res.json(parsedLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add patient log
app.post('/api/patient-logs', async (req, res) => {
  const { patientId, doctorId, doctorName, examination, drugs, investigations } = req.body;
  if (!patientId || !doctorId) {
    return res.status(400).json({ error: 'patientId and doctorId are required' });
  }
  
  try {
    const id = await generateNextId('patient_logs', 'LOG');
    const date = new Date().toISOString().split('T')[0];
    
    const examStr = JSON.stringify(examination || {});
    const drugsStr = JSON.stringify(drugs || []);
    const invStr = JSON.stringify(investigations || []);
    
    await dbHelpers.run(
      `INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr]
    );
    
    const newLog = {
      id, patientId, doctorId, doctorName, date,
      examination: examination || {},
      drugs: drugs || [],
      investigations: investigations || []
    };
    
    res.status(201).json(newLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Prescriptions Endpoints ──

// Get all prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    const prescriptions = await dbHelpers.all('SELECT * FROM prescriptions');
    const parsed = prescriptions.map(p => ({
      ...p,
      drugs: JSON.parse(p.drugs)
    }));
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add prescription
app.post('/api/prescriptions', async (req, res) => {
  const { patientId, logId, addedBy, drugs } = req.body;
  if (!patientId || !drugs) {
    return res.status(400).json({ error: 'patientId and drugs are required' });
  }
  
  try {
    const id = await generateNextId('prescriptions', 'RX');
    const date = new Date().toISOString().split('T')[0];
    const drugsStr = JSON.stringify(drugs);
    
    await dbHelpers.run(
      `INSERT INTO prescriptions (id, patientId, logId, addedBy, date, drugs)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, patientId, logId || null, addedBy, date, drugsStr]
    );
    
    const newRx = {
      id, patientId, logId: logId || null, addedBy, date, drugs
    };
    
    res.status(201).json(newRx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Alerts Endpoints ──

// Get all alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await dbHelpers.all('SELECT * FROM alerts');
    const result = alerts.map(a => ({
      ...a,
      read: a.read === 1
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark alert as read
app.put('/api/alerts/:id/read', async (req, res) => {
  try {
    await dbHelpers.run('UPDATE alerts SET read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all alerts as read
app.put('/api/alerts/read-all', async (req, res) => {
  try {
    await dbHelpers.run('UPDATE alerts SET read = 1');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add custom alert (e.g. from patient reports or system checkups)
app.post('/api/alerts', async (req, res) => {
  const { patientId, patientName, type, message, severity } = req.body;
  try {
    const id = await generateNextId('alerts', 'AL');
    const date = new Date().toISOString();
    await dbHelpers.run(
      `INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, patientId, patientName, type, message, severity, date]
    );
    
    res.status(201).json({ id, patientId, patientName, type, message, severity, date, read: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Symptom Logs Endpoints ──

// Get all symptom logs
app.get('/api/symptom-logs', async (req, res) => {
  try {
    const logs = await dbHelpers.all('SELECT * FROM symptom_logs');
    const result = logs.map(l => ({
      ...l,
      symptoms: JSON.parse(l.symptoms)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add symptom log
app.post('/api/symptom-logs', async (req, res) => {
  const { patientId, patientName, date, symptoms, severity, notes, reportedVia } = req.body;
  if (!patientId || !patientName || !symptoms) {
    return res.status(400).json({ error: 'patientId, patientName and symptoms are required' });
  }
  
  try {
    const id = await generateNextId('symptom_logs', 'SL');
    const dateStr = date || new Date().toISOString();
    const symptomsStr = JSON.stringify(symptoms);
    
    await dbHelpers.run(
      `INSERT INTO symptom_logs (id, patientId, patientName, date, symptoms, severity, notes, reportedVia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, patientName, dateStr, symptomsStr, severity, notes, reportedVia || 'App']
    );
    
    // Automatically trigger an alert if the severity is Severe
    if (severity === 'Severe') {
      const alertId = await generateNextId('alerts', 'AL');
      await dbHelpers.run(
        `INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read)
         VALUES (?, ?, ?, 'Symptom', ?, 'danger', ?, 0)`,
        [alertId, patientId, patientName, `Patient reported severe symptoms: ${symptoms.join(', ')}`, dateStr]
      );
    }
    
    res.status(201).json({
      id, patientId, patientName, date: dateStr, symptoms, severity, notes, reportedVia: reportedVia || 'App'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server after initializing DB
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
