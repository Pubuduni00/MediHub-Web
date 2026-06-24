const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper to translate SQLite "?" placeholders to PostgreSQL "$1, $2, ..." placeholders
function translateSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

const camelCaseMap = {
  patientid: 'patientId',
  patientname: 'patientName',
  doctorid: 'doctorId',
  doctorname: 'doctorName',
  joindate: 'joinDate',
  bloodgroup: 'bloodGroup',
  emergencycontact: 'emergencyContact',
  emergencyname: 'emergencyName',
  registereddate: 'registeredDate',
  medicalhistory: 'medicalHistory',
  statushistory: 'statusHistory',
  logid: 'logId',
  addedby: 'addedBy',
  reportedvia: 'reportedVia'
};

function mapKeysToCamelCase(row) {
  if (!row) return row;
  const mapped = {};
  for (const key of Object.keys(row)) {
    const camelKey = camelCaseMap[key] || key;
    mapped[camelKey] = row[key];
  }
  return mapped;
}

const dbHelpers = {
  all: async (sql, params = []) => {
    const translatedSql = translateSql(sql);
    const result = await pool.query(translatedSql, params);
    return result.rows.map(mapKeysToCamelCase);
  },
  get: async (sql, params = []) => {
    const translatedSql = translateSql(sql);
    const result = await pool.query(translatedSql, params);
    return mapKeysToCamelCase(result.rows[0]) || null;
  },
  run: async (sql, params = []) => {
    const translatedSql = translateSql(sql);
    const result = await pool.query(translatedSql, params);
    return { id: null, changes: result.rowCount };
  },
  exec: async (sql) => {
    await pool.query(sql);
  }
};

// Initialize database schema and seed initial data if needed
async function initDatabase() {
  try {
    console.log('Connecting to PostgreSQL database and initializing schema...');

    // 1. Create Staff Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT,
        department TEXT
      )
    `);

    // 2. Create Doctors Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        specialty TEXT,
        department TEXT,
        phone TEXT,
        qualification TEXT,
        joinDate TEXT,
        status TEXT,
        schedule TEXT,
        role TEXT,
        avatar TEXT
      )
    `);

    // 3. Create Patients Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        dob TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        bloodGroup TEXT,
        nic TEXT,
        emergencyContact TEXT,
        emergencyName TEXT,
        registeredDate TEXT,
        status TEXT,
        medicalHistory TEXT,
        statusHistory TEXT
      )
    `);

    // Migration for existing databases
    try {
      await dbHelpers.run('ALTER TABLE patients ADD COLUMN medicalHistory TEXT');
    } catch (e) {
      // ignore error if column already exists
    }
    try {
      await dbHelpers.run('ALTER TABLE patients ADD COLUMN statusHistory TEXT');
    } catch (e) {
      // ignore error if column already exists
    }

    // 4. Create Doctor-Patient assignment join table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS doctor_patients (
        doctor_id TEXT,
        patient_id TEXT,
        PRIMARY KEY (doctor_id, patient_id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    // 5. Create Appointments Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patientId TEXT,
        patientName TEXT,
        doctorId TEXT,
        doctorName TEXT,
        date TEXT,
        time TEXT,
        type TEXT,
        status TEXT,
        details TEXT,
        duration INTEGER,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (doctorId) REFERENCES doctors(id)
      )
    `);

    // 6. Create Patient Logs Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS patient_logs (
        id TEXT PRIMARY KEY,
        patientId TEXT,
        doctorId TEXT,
        doctorName TEXT,
        date TEXT,
        examination TEXT,
        drugs TEXT,
        investigations TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (doctorId) REFERENCES doctors(id)
      )
    `);

    // 7. Create Prescriptions Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        patientId TEXT,
        logId TEXT,
        addedBy TEXT,
        date TEXT,
        drugs TEXT,
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (logId) REFERENCES patient_logs(id)
      )
    `);

    // 8. Create Alerts Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        patientId TEXT,
        patientName TEXT,
        type TEXT,
        message TEXT,
        severity TEXT,
        date TEXT,
        read INTEGER DEFAULT 0
      )
    `);

    // 9. Create Symptom Logs Table
    await dbHelpers.run(`
      CREATE TABLE IF NOT EXISTS symptom_logs (
        id TEXT PRIMARY KEY,
        patientId TEXT,
        patientName TEXT,
        date TEXT,
        symptoms TEXT,
        severity TEXT,
        notes TEXT,
        reportedVia TEXT
      )
    `);

    // Seed data if database is brand new (check staff count)
    const staffCountResult = await dbHelpers.get('SELECT COUNT(*) as count FROM staff');
    const count = parseInt(staffCountResult.count, 10);

    if (count === 0) {
      console.log('Seeding initial data into PostgreSQL...');

      // 1. Seed Staff
      const staffMembers = [
        ['ST001', 'admin@medihub.com', 'Staff@1234', 'Sarah Johnson', 'staff', 'Administration'],
        ['ST002', 'reception@medihub.com', 'Staff@1234', 'Michael Chen', 'staff', 'Reception'],
        ['ST003', 'staff@medihub.com', 'Staff@1234', 'Pubuduni Mayanthi', 'staff', 'General Medicine']
      ];
      for (const s of staffMembers) {
        await dbHelpers.run(
          'INSERT INTO staff (id, email, password, name, role, department) VALUES (?, ?, ?, ?, ?, ?)',
          s
        );
      }

      // 2. Seed Doctors
      const doctors = [
        ['DR001', 'Dr. Amara Patel', 'amara.patel@medihub.com', 'Cardiology', 'Cardiology', '0112345678', 'MBBS, MD (Cardiology)', '2020-01-10', 'Active', 'Mon-Fri, 8AM-4PM', 'doctor', null],
        ['DR002', 'Dr. James Wilson', 'james.wilson@medihub.com', 'General Medicine', 'General Medicine', '0112345679', 'MBBS, MRCP', '2019-06-15', 'Active', 'Mon-Sat, 9AM-5PM', 'doctor', null],
        ['DR003', 'Dr. Priya Nair', 'priya.nair@medihub.com', 'Neurology', 'Neurology', '0112345680', 'MBBS, MD (Neurology)', '2021-03-20', 'Active', 'Tue-Sat, 8AM-3PM', 'doctor', null],
        ['DR004', 'Dr. Suresh Rajapaksa', 'suresh.r@medihub.com', 'Orthopedics', 'Orthopedics', '0112345681', 'MBBS, MS (Ortho)', '2018-11-01', 'Active', 'Mon-Fri, 10AM-6PM', 'doctor', null]
      ];
      for (const d of doctors) {
        await dbHelpers.run(
          'INSERT INTO doctors (id, name, email, specialty, department, phone, qualification, joinDate, status, schedule, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          d
        );
      }

      // 3. Seed Patients
      const patients = [
        ['PT001', 'Rohan Fernando', 45, 'Male', '1979-03-12', '0771234567', 'rohan@email.com', '12 Galle Road, Colombo 03', 'B+', '791234567V', '0777654321', 'Priya Fernando', '2024-01-15', 'Active'],
        ['PT002', 'Kamala Perera', 32, 'Female', '1992-07-25', '0712345678', 'kamala@email.com', '45 Kandy Road, Colombo 07', 'O+', '9234567890V', '0718765432', 'Sunil Perera', '2024-02-20', 'Active'],
        ['PT003', 'Arun Wickramasinghe', 58, 'Male', '1966-11-08', '0759876543', 'arun@email.com', '78 High Level Road, Maharagama', 'A-', '661234567V', '0754321098', 'Mala Wickramasinghe', '2024-03-05', 'Active'],
        ['PT004', 'Sandya Jayawardena', 28, 'Female', '1996-05-14', '0781234321', 'sandya@email.com', '23 Duplication Road, Colombo 04', 'AB+', '961234567V', '0787654321', 'Nimal Jayawardena', '2024-04-10', 'Active'],
        ['PT005', 'Malik Bandara', 67, 'Male', '1957-09-22', '0763219876', 'malik@email.com', '5 Colombo Road, Kurunegala', 'O-', '571234567V', '0769876543', 'Seetha Bandara', '2024-05-01', 'Inactive']
      ];
      for (const p of patients) {
        await dbHelpers.run(
          'INSERT INTO patients (id, name, age, gender, dob, phone, email, address, bloodGroup, nic, emergencyContact, emergencyName, registeredDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          p
        );
      }

      // 4. Seed Assignments
      const assignments = [
        ['DR001', 'PT001'],
        ['DR002', 'PT002'],
        ['DR001', 'PT003'],
        ['DR003', 'PT003'],
        ['DR002', 'PT004'],
        ['DR001', 'PT005']
      ];
      for (const a of assignments) {
        await dbHelpers.run('INSERT INTO doctor_patients (doctor_id, patient_id) VALUES (?, ?)', a);
      }

      // 5. Seed Appointments
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
      const appointments = [
        ['AP001', 'PT001', 'Rohan Fernando', 'DR001', 'Dr. Amara Patel', today, '09:00', 'Follow-up', 'Confirmed', 'Routine cardiac checkup', 30],
        ['AP002', 'PT002', 'Kamala Perera', 'DR002', 'Dr. James Wilson', today, '10:30', 'Consultation', 'Confirmed', 'First visit - general checkup', 45],
        ['AP003', 'PT003', 'Arun Wickramasinghe', 'DR001', 'Dr. Amara Patel', today, '11:00', 'Review', 'Pending', 'ECG review', 30],
        ['AP004', 'PT004', 'Sandya Jayawardena', 'DR002', 'Dr. James Wilson', tomorrow, '14:00', 'Follow-up', 'Confirmed', 'Blood test results', 20],
        ['AP005', 'PT005', 'Malik Bandara', 'DR003', 'Dr. Priya Nair', dayAfter, '09:30', 'Consultation', 'Confirmed', 'Neurological assessment', 60]
      ];
      for (const ap of appointments) {
        await dbHelpers.run(
          'INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          ap
        );
      }

      // 6. Seed Patient Logs
      const log1Examination = JSON.stringify({ chiefComplaint: 'Chest pain and shortness of breath', bp: '140/90', pulse: '88', temp: '37.1', spo2: '97', weight: '78', height: '172', clinicalFindings: 'Mild hypertension. Heart sounds normal.', diagnosis: 'Hypertension Grade 1', plan: 'Lifestyle modification, follow-up in 4 weeks' });
      const log1Drugs = JSON.stringify([{ drug: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '30 days', mealInstruction: 'After meals', notes: 'Take in the morning' }]);
      const log1Investigations = JSON.stringify([{ type: 'ECG', dateOrdered: '2024-06-10', results: 'Normal sinus rhythm', referenceRange: 'Normal', status: 'Normal', notes: '' }]);

      const log2Examination = JSON.stringify({ chiefComplaint: 'Follow-up for hypertension', bp: '135/85', pulse: '80', temp: '36.8', spo2: '98', weight: '77', height: '172', clinicalFindings: 'BP improving.', diagnosis: 'Hypertension - improving', plan: 'Continue medication, repeat bloods in 3 months' });
      const log2Drugs = JSON.stringify([{ drug: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '90 days', mealInstruction: 'After meals', notes: '' }, { drug: 'Aspirin', dose: '75mg', frequency: 'Once daily', duration: '90 days', mealInstruction: 'After meals', notes: 'Do not crush' }]);
      const log2Investigations = JSON.stringify([{ type: 'Lipid Profile', dateOrdered: '2024-07-08', results: 'Total Cholesterol: 5.2 mmol/L', referenceRange: '<5.0 mmol/L', status: 'Abnormal', notes: 'Borderline high' }]);

      await dbHelpers.run(
        'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['LOG001', 'PT001', 'DR001', 'Dr. Amara Patel', '2024-06-10', log1Examination, log1Drugs, log1Investigations]
      );
      await dbHelpers.run(
        'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['LOG002', 'PT001', 'DR001', 'Dr. Amara Patel', '2024-07-08', log2Examination, log2Drugs, log2Investigations]
      );

      // 7. Seed Prescriptions
      await dbHelpers.run(
        'INSERT INTO prescriptions (id, patientId, logId, addedBy, date, drugs) VALUES (?, ?, ?, ?, ?, ?)',
        ['RX001', 'PT001', 'LOG001', 'ST001', '2024-06-10', log1Drugs]
      );

      // 8. Seed Alerts
      const alerts = [
        ['AL001', 'PT001', 'Rohan Fernando', 'Medication', 'Patient missed medication reminder for 2 days', 'warning', new Date().toISOString(), 0],
        ['AL002', 'PT003', 'Arun Wickramasinghe', 'Appointment', 'Upcoming appointment in 1 hour', 'info', new Date().toISOString(), 0],
        ['AL003', 'PT002', 'Kamala Perera', 'Lab Result', 'Critical lab result received - review required', 'danger', new Date(Date.now() - 3600000).toISOString(), 1],
        ['AL004', 'PT005', 'Malik Bandara', 'Symptom', 'Patient reported severe headache via app', 'danger', new Date(Date.now() - 7200000).toISOString(), 0]
      ];
      for (const al of alerts) {
        await dbHelpers.run(
          'INSERT INTO alerts (id, patientId, patientName, type, message, severity, date, read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          al
        );
      }

      // 9. Seed Symptom Logs
      const symptomLogs = [
        ['SL001', 'PT001', 'Rohan Fernando', new Date().toISOString(), JSON.stringify(['Chest tightness', 'Mild dizziness']), 'Moderate', 'Occurred after walking up stairs', 'App'],
        ['SL002', 'PT002', 'Kamala Perera', new Date(Date.now() - 86400000).toISOString(), JSON.stringify(['Headache', 'Fatigue']), 'Mild', 'Started in the morning', 'App'],
        ['SL003', 'PT005', 'Malik Bandara', new Date(Date.now() - 3600000).toISOString(), JSON.stringify(['Severe headache', 'Nausea', 'Blurred vision']), 'Severe', 'Sudden onset, patient concerned', 'App']
      ];
      for (const sl of symptomLogs) {
        await dbHelpers.run(
          'INSERT INTO symptom_logs (id, patientId, patientName, date, symptoms, severity, notes, reportedVia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          sl
        );
      }

      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL database Schema:', err);
    throw err;
  }
}

module.exports = {
  dbHelpers,
  initDatabase
};
