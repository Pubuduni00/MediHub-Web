import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const DataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientLogs, setPatientLogs] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [patientsRes, doctorsRes, apptsRes, logsRes, rxRes, alertsRes, symptomsRes] = await Promise.all([
        fetch(`${API_URL}/patients`),
        fetch(`${API_URL}/doctors`),
        fetch(`${API_URL}/appointments`),
        fetch(`${API_URL}/patient-logs`),
        fetch(`${API_URL}/prescriptions`),
        fetch(`${API_URL}/alerts`),
        fetch(`${API_URL}/symptom-logs`)
      ]);

      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      if (apptsRes.ok) setAppointments(await apptsRes.json());
      if (logsRes.ok) setPatientLogs(await logsRes.json());
      if (rxRes.ok) setPrescriptions(await rxRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (symptomsRes.ok) setSymptomLogs(await symptomsRes.json());
    } catch (err) {
      console.error("Error refreshing data from API:", err);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, []);

  // ── Patients ──
  const addPatient = async (patient) => {
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      if (res.ok) {
        const newPatient = await res.json();
        setPatients(prev => [...prev, newPatient]);
        return newPatient;
      }
    } catch (err) {
      console.error("Failed to add patient:", err);
    }
  };

  const updatePatient = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedPatient = await res.json();
        setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
        return updatedPatient;
      }
    } catch (err) {
      console.error("Failed to update patient:", err);
    }
  };

  const syncPatientToMobile = async (id) => {
    try {
      const res = await fetch(`${API_URL}/sync/patient/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to sync patient:", err);
      return { success: false, error: 'Could not connect to sync server' };
    }
  };

  const getPatientById = (id) => patients.find(p => p.id === id);

  const assignPatientToDoctor = async (patientId, doctorId) => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/assign-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      if (res.ok) {
        setPatients(prev => prev.map(p => {
          if (p.id === patientId && !p.assignedDoctors.includes(doctorId)) {
            return { ...p, assignedDoctors: [...p.assignedDoctors, doctorId] };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to assign patient to doctor:", err);
    }
  };

  const getPatientsForDoctor = (doctorId) => patients.filter(p => p.assignedDoctors?.includes(doctorId));

  // ── Appointments ──
  const addAppointment = async (appt) => {
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appt)
      });
      if (res.ok) {
        const newAppt = await res.json();
        setAppointments(prev => [...prev, newAppt]);
        
        // Also update local patient assignment since backend automatically links them
        setPatients(prev => prev.map(p => {
          if (p.id === appt.patientId && !p.assignedDoctors.includes(appt.doctorId)) {
            return { ...p, assignedDoctors: [...p.assignedDoctors, appt.doctorId] };
          }
          return p;
        }));
        
        return newAppt;
      }
    } catch (err) {
      console.error("Failed to add appointment:", err);
    }
  };

  const updateAppointment = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedAppt = await res.json();
        setAppointments(prev => prev.map(a => a.id === id ? updatedAppt : a));
        return updatedAppt;
      }
    } catch (err) {
      console.error("Failed to update appointment:", err);
    }
  };

  const getAppointmentsForDate = (date) => appointments.filter(a => a.date === date);
  const getAppointmentsForDoctor = (doctorId) => appointments.filter(a => a.doctorId === doctorId);

  // ── Patient Logs ──
  const addPatientLog = async (log) => {
    try {
      const res = await fetch(`${API_URL}/patient-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (res.ok) {
        const newLog = await res.json();
        setPatientLogs(prev => [...prev, newLog]);
        return newLog;
      }
    } catch (err) {
      console.error("Failed to add patient log:", err);
    }
  };

  const getLogsForPatient = (patientId) => patientLogs.filter(l => l.patientId === patientId);
  const getLogsForDate = (patientId, date) => patientLogs.filter(l => l.patientId === patientId && l.date === date);

  // ── Prescriptions ──
  const addPrescription = async (rx) => {
    try {
      const res = await fetch(`${API_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rx)
      });
      if (res.ok) {
        const newRx = await res.json();
        setPrescriptions(prev => [...prev, newRx]);
        return newRx;
      }
    } catch (err) {
      console.error("Failed to add prescription:", err);
    }
  };

  const getPrescriptionsForPatient = (patientId) => prescriptions.filter(r => r.patientId === patientId);

  const stopMedication = async (patientId, medId) => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/medications/${medId}/stop`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        // Update local prescriptions state
        setPrescriptions(prev => prev.map(rx => {
          const parts = medId.split('_');
          const logId = parts[0];
          const drugName = parts.slice(1).join(' ').replace(/_/g, ' ');
          if (rx.logId === logId || rx.id === logId) {
            const updatedDrugs = rx.drugs.map(d => {
              if (d.drug.toLowerCase().trim() === drugName.toLowerCase().trim()) {
                return { ...d, endDate: data.endDate };
              }
              return d;
            });
            return { ...rx, drugs: updatedDrugs };
          }
          return rx;
        }));
        
        // Also update local patientLogs state
        setPatientLogs(prev => prev.map(log => {
          const parts = medId.split('_');
          const logId = parts[0];
          const drugName = parts.slice(1).join(' ').replace(/_/g, ' ');
          if (log.id === logId) {
            const updatedDrugs = log.drugs.map(d => {
              if (d.drug.toLowerCase().trim() === drugName.toLowerCase().trim()) {
                return { ...d, endDate: data.endDate };
              }
              return d;
            });
            return { ...log, drugs: updatedDrugs };
          }
          return log;
        }));
      }
    } catch (err) {
      console.error("Failed to stop medication:", err);
    }
  };

  const editMedication = async (patientId, medId, updates) => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}/medications/${medId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        const parts = medId.split('_');
        const logId = parts[0];
        const drugName = parts.slice(1).join(' ').replace(/_/g, ' ');

        // Update local prescriptions state
        setPrescriptions(prev => prev.map(rx => {
          if (rx.logId === logId || rx.id === logId) {
            const updatedDrugs = rx.drugs.map(d => {
              if (d.drug.toLowerCase().trim() === drugName.toLowerCase().trim()) {
                return { ...d, ...data.updated };
              }
              return d;
            });
            return { ...rx, drugs: updatedDrugs };
          }
          return rx;
        }));
        
        // Also update local patientLogs state
        setPatientLogs(prev => prev.map(log => {
          if (log.id === logId) {
            const updatedDrugs = log.drugs.map(d => {
              if (d.drug.toLowerCase().trim() === drugName.toLowerCase().trim()) {
                return { ...d, ...data.updated };
              }
              return d;
            });
            return { ...log, drugs: updatedDrugs };
          }
          return log;
        }));
      }
    } catch (err) {
      console.error("Failed to edit medication:", err);
    }
  };

  // ── Doctors ──
  const addDoctor = async (doc) => {
    try {
      const res = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDoctors(prev => [...prev, newDoc]);
        return newDoc;
      }
    } catch (err) {
      console.error("Failed to add doctor:", err);
    }
  };

  // ── Alerts ──
  const markAlertRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
      }
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const markAllAlertsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts/read-all`, {
        method: 'PUT'
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <DataContext.Provider value={{
      patients, doctors, appointments, patientLogs, prescriptions, alerts, symptomLogs, loading,
      addPatient, updatePatient, syncPatientToMobile, getPatientById, assignPatientToDoctor, getPatientsForDoctor,
      addAppointment, updateAppointment, getAppointmentsForDate, getAppointmentsForDoctor,
      addPatientLog, getLogsForPatient, getLogsForDate,
      addPrescription, getPrescriptionsForPatient, stopMedication, editMedication, refreshData,
      addDoctor, setDoctors, setAppointments,
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
