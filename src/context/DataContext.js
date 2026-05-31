import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

// Initial demo data
const initialPatients = [
  { id: 'PT001', name: 'Rohan Fernando', age: 45, gender: 'Male', dob: '1979-03-12', phone: '0771234567', email: 'rohan@email.com', address: '12 Galle Road, Colombo 03', bloodGroup: 'B+', nic: '791234567V', emergencyContact: '0777654321', emergencyName: 'Priya Fernando', registeredDate: '2024-01-15', assignedDoctors: ['DR001'], status: 'Active' },
  { id: 'PT002', name: 'Kamala Perera', age: 32, gender: 'Female', dob: '1992-07-25', phone: '0712345678', email: 'kamala@email.com', address: '45 Kandy Road, Colombo 07', bloodGroup: 'O+', nic: '9234567890V', emergencyContact: '0718765432', emergencyName: 'Sunil Perera', registeredDate: '2024-02-20', assignedDoctors: ['DR002'], status: 'Active' },
  { id: 'PT003', name: 'Arun Wickramasinghe', age: 58, gender: 'Male', dob: '1966-11-08', phone: '0759876543', email: 'arun@email.com', address: '78 High Level Road, Maharagama', bloodGroup: 'A-', nic: '661234567V', emergencyContact: '0754321098', emergencyName: 'Mala Wickramasinghe', registeredDate: '2024-03-05', assignedDoctors: ['DR001', 'DR003'], status: 'Active' },
  { id: 'PT004', name: 'Sandya Jayawardena', age: 28, gender: 'Female', dob: '1996-05-14', phone: '0781234321', email: 'sandya@email.com', address: '23 Duplication Road, Colombo 04', bloodGroup: 'AB+', nic: '961234567V', emergencyContact: '0787654321', emergencyName: 'Nimal Jayawardena', registeredDate: '2024-04-10', assignedDoctors: ['DR002'], status: 'Active' },
  { id: 'PT005', name: 'Malik Bandara', age: 67, gender: 'Male', dob: '1957-09-22', phone: '0763219876', email: 'malik@email.com', address: '5 Colombo Road, Kurunegala', bloodGroup: 'O-', nic: '571234567V', emergencyContact: '0769876543', emergencyName: 'Seetha Bandara', registeredDate: '2024-05-01', assignedDoctors: ['DR001'], status: 'Inactive' },
];

const initialDoctors = [
  { id: 'DR001', name: 'Dr. Amara Patel', email: 'amara.patel@medihub.com', specialty: 'Cardiology', department: 'Cardiology', phone: '0112345678', employeeId: 'DR001', qualification: 'MBBS, MD (Cardiology)', joinDate: '2020-01-10', status: 'Active', schedule: 'Mon-Fri, 8AM-4PM' },
  { id: 'DR002', name: 'Dr. James Wilson', email: 'james.wilson@medihub.com', specialty: 'General Medicine', department: 'General Medicine', phone: '0112345679', employeeId: 'DR002', qualification: 'MBBS, MRCP', joinDate: '2019-06-15', status: 'Active', schedule: 'Mon-Sat, 9AM-5PM' },
  { id: 'DR003', name: 'Dr. Priya Nair', email: 'priya.nair@medihub.com', specialty: 'Neurology', department: 'Neurology', phone: '0112345680', employeeId: 'DR003', qualification: 'MBBS, MD (Neurology)', joinDate: '2021-03-20', status: 'Active', schedule: 'Tue-Sat, 8AM-3PM' },
  { id: 'DR004', name: 'Dr. Suresh Rajapaksa', email: 'suresh.r@medihub.com', specialty: 'Orthopedics', department: 'Orthopedics', phone: '0112345681', employeeId: 'DR004', qualification: 'MBBS, MS (Ortho)', joinDate: '2018-11-01', status: 'Active', schedule: 'Mon-Fri, 10AM-6PM' },
];

const initialAppointments = [
  { id: 'AP001', patientId: 'PT001', patientName: 'Rohan Fernando', doctorId: 'DR001', doctorName: 'Dr. Amara Patel', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Follow-up', status: 'Confirmed', details: 'Routine cardiac checkup', duration: 30 },
  { id: 'AP002', patientId: 'PT002', patientName: 'Kamala Perera', doctorId: 'DR002', doctorName: 'Dr. James Wilson', date: new Date().toISOString().split('T')[0], time: '10:30', type: 'Consultation', status: 'Confirmed', details: 'First visit - general checkup', duration: 45 },
  { id: 'AP003', patientId: 'PT003', patientName: 'Arun Wickramasinghe', doctorId: 'DR001', doctorName: 'Dr. Amara Patel', date: new Date().toISOString().split('T')[0], time: '11:00', type: 'Review', status: 'Pending', details: 'ECG review', duration: 30 },
  { id: 'AP004', patientId: 'PT004', patientName: 'Sandya Jayawardena', doctorId: 'DR002', doctorName: 'Dr. James Wilson', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00', type: 'Follow-up', status: 'Confirmed', details: 'Blood test results', duration: 20 },
  { id: 'AP005', patientId: 'PT005', patientName: 'Malik Bandara', doctorId: 'DR003', doctorName: 'Dr. Priya Nair', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '09:30', type: 'Consultation', status: 'Confirmed', details: 'Neurological assessment', duration: 60 },
];

const initialPatientLogs = [
  {
    id: 'LOG001', patientId: 'PT001', doctorId: 'DR001', doctorName: 'Dr. Amara Patel', date: '2024-06-10',
    examination: { chiefComplaint: 'Chest pain and shortness of breath', bp: '140/90', pulse: '88', temp: '37.1', spo2: '97', weight: '78', height: '172', clinicalFindings: 'Mild hypertension. Heart sounds normal. No murmurs.', diagnosis: 'Hypertension Grade 1', plan: 'Lifestyle modification, follow-up in 4 weeks' },
    drugs: [{ drug: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '30 days', mealInstruction: 'After meals', notes: 'Take in the morning' }],
    investigations: [{ type: 'ECG', dateOrdered: '2024-06-10', results: 'Normal sinus rhythm', referenceRange: 'Normal', status: 'Normal', notes: '' }]
  },
  {
    id: 'LOG002', patientId: 'PT001', doctorId: 'DR001', doctorName: 'Dr. Amara Patel', date: '2024-07-08',
    examination: { chiefComplaint: 'Follow-up for hypertension', bp: '135/85', pulse: '80', temp: '36.8', spo2: '98', weight: '77', height: '172', clinicalFindings: 'BP improving. Patient compliant with medication.', diagnosis: 'Hypertension - improving', plan: 'Continue medication, repeat bloods in 3 months' },
    drugs: [{ drug: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '90 days', mealInstruction: 'After meals', notes: '' }, { drug: 'Aspirin', dose: '75mg', frequency: 'Once daily', duration: '90 days', mealInstruction: 'After meals', notes: 'Do not crush' }],
    investigations: [{ type: 'Lipid Profile', dateOrdered: '2024-07-08', results: 'Total Cholesterol: 5.2 mmol/L', referenceRange: '<5.0 mmol/L', status: 'Abnormal', notes: 'Borderline high' }]
  },
];

const initialPrescriptions = [
  { id: 'RX001', patientId: 'PT001', logId: 'LOG001', addedBy: 'ST001', date: '2024-06-10', drugs: [{ drug: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '30 days', mealInstruction: 'After meals', notes: 'Take in the morning' }] },
];

const initialAlerts = [
  { id: 'AL001', patientId: 'PT001', patientName: 'Rohan Fernando', type: 'Medication', message: 'Patient missed medication reminder for 2 days', severity: 'warning', date: new Date().toISOString(), read: false },
  { id: 'AL002', patientId: 'PT003', patientName: 'Arun Wickramasinghe', type: 'Appointment', message: 'Upcoming appointment in 1 hour', severity: 'info', date: new Date().toISOString(), read: false },
  { id: 'AL003', patientId: 'PT002', patientName: 'Kamala Perera', type: 'Lab Result', message: 'Critical lab result received - review required', severity: 'danger', date: new Date(Date.now() - 3600000).toISOString(), read: true },
  { id: 'AL004', patientId: 'PT005', patientName: 'Malik Bandara', type: 'Symptom', message: 'Patient reported severe headache via app', severity: 'danger', date: new Date(Date.now() - 7200000).toISOString(), read: false },
];

const initialSymptomLogs = [
  { id: 'SL001', patientId: 'PT001', patientName: 'Rohan Fernando', date: new Date().toISOString(), symptoms: ['Chest tightness', 'Mild dizziness'], severity: 'Moderate', notes: 'Occurred after walking up stairs', reportedVia: 'App' },
  { id: 'SL002', patientId: 'PT002', patientName: 'Kamala Perera', date: new Date(Date.now() - 86400000).toISOString(), symptoms: ['Headache', 'Fatigue'], severity: 'Mild', notes: 'Started in the morning', reportedVia: 'App' },
  { id: 'SL003', patientId: 'PT005', patientName: 'Malik Bandara', date: new Date(Date.now() - 3600000).toISOString(), symptoms: ['Severe headache', 'Nausea', 'Blurred vision'], severity: 'Severe', notes: 'Sudden onset, patient concerned', reportedVia: 'App' },
];

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState(initialPatients);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [patientLogs, setPatientLogs] = useState(initialPatientLogs);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [symptomLogs, setSymptomLogs] = useState(initialSymptomLogs);

  // Patients
  const addPatient = (patient) => {
    const id = `PT${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient = { ...patient, id, registeredDate: new Date().toISOString().split('T')[0], assignedDoctors: [], status: 'Active' };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };
  const updatePatient = (id, updates) => setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const getPatientById = (id) => patients.find(p => p.id === id);

  // Assign patient to doctor
  const assignPatientToDoctor = (patientId, doctorId) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId && !p.assignedDoctors.includes(doctorId)) {
        return { ...p, assignedDoctors: [...p.assignedDoctors, doctorId] };
      }
      return p;
    }));
  };
  const getPatientsForDoctor = (doctorId) => patients.filter(p => p.assignedDoctors.includes(doctorId));

  // Appointments
  const addAppointment = (appt) => {
    const id = `AP${String(appointments.length + 1).padStart(3, '0')}`;
    const newAppt = { ...appt, id };
    setAppointments(prev => [...prev, newAppt]);
    return newAppt;
  };
  const getAppointmentsForDate = (date) => appointments.filter(a => a.date === date);
  const getAppointmentsForDoctor = (doctorId) => appointments.filter(a => a.doctorId === doctorId);

  // Patient Logs
  const addPatientLog = (log) => {
    const id = `LOG${String(patientLogs.length + 1).padStart(3, '0')}`;
    const newLog = { ...log, id, date: new Date().toISOString().split('T')[0] };
    setPatientLogs(prev => [...prev, newLog]);
    return newLog;
  };
  const getLogsForPatient = (patientId) => patientLogs.filter(l => l.patientId === patientId);
  const getLogsForDate = (patientId, date) => patientLogs.filter(l => l.patientId === patientId && l.date === date);

  // Prescriptions
  const addPrescription = (rx) => {
    const id = `RX${String(prescriptions.length + 1).padStart(3, '0')}`;
    const newRx = { ...rx, id, date: new Date().toISOString().split('T')[0] };
    setPrescriptions(prev => [...prev, newRx]);
    return newRx;
  };
  const getPrescriptionsForPatient = (patientId) => prescriptions.filter(r => r.patientId === patientId);

  // Doctors
  const addDoctor = (doc) => {
    const id = `DR${String(doctors.length + 1).padStart(3, '0')}`;
    const newDoc = { ...doc, id, employeeId: id };
    setDoctors(prev => [...prev, newDoc]);
    return newDoc;
  };

  // Alerts
  const markAlertRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  const markAllAlertsRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <DataContext.Provider value={{
      patients, doctors, appointments, patientLogs, prescriptions, alerts, symptomLogs,
      addPatient, updatePatient, getPatientById, assignPatientToDoctor, getPatientsForDoctor,
      addAppointment, getAppointmentsForDate, getAppointmentsForDoctor,
      addPatientLog, getLogsForPatient, getLogsForDate,
      addPrescription, getPrescriptionsForPatient,
      addDoctor, setDoctors,
      markAlertRead, markAllAlertsRead, unreadCount,
      setSymptomLogs,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
