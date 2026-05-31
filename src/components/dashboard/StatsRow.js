import React from 'react';
import { Users, Calendar, Bell, UserCheck, Activity, Stethoscope } from 'lucide-react';
import StatCard from '../common/StatCard';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function StatsRow() {
  const { patients, appointments, alerts, symptomLogs, getPatientsForDoctor } = useData();
  const { user, isDoctor } = useAuth();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppts = appointments.filter(a => a.date === today);
  const unread = alerts.filter(a => !a.read).length;
  const myPatients = isDoctor ? getPatientsForDoctor(user?.id) : [];
  const criticalSymptoms = symptomLogs.filter(s => s.severity === 'Severe').length;

  if (isDoctor) {
    return (
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="My Patients" value={myPatients.length} icon={UserCheck} color="var(--primary)" bgColor="var(--primary-light)" subtitle="Under your care" />
        <StatCard label="Today's Appointments" value={todayAppts.filter(a => a.doctorId === user?.id).length} icon={Calendar} color="var(--secondary)" bgColor="var(--secondary-light)" subtitle={format(new Date(), 'dd MMM yyyy')} />
        <StatCard label="Unread Alerts" value={unread} icon={Bell} color="var(--accent-orange)" bgColor="var(--accent-orange-light)" subtitle="Require attention" />
        <StatCard label="Symptom Reports" value={symptomLogs.length} icon={Activity} color="var(--accent-red)" bgColor="var(--accent-red-light)" subtitle={`${criticalSymptoms} critical`} />
      </div>
    );
  }

  return (
    <div className="grid grid-4" style={{ marginBottom: 24 }}>
      <StatCard label="Total Patients" value={patients.length} icon={Users} color="var(--primary)" bgColor="var(--primary-light)" subtitle={`${patients.filter(p => p.status === 'Active').length} active`} />
      <StatCard label="Today's Appointments" value={todayAppts.length} icon={Calendar} color="var(--secondary)" bgColor="var(--secondary-light)" subtitle={format(new Date(), 'dd MMM yyyy')} />
      <StatCard label="Unread Alerts" value={unread} icon={Bell} color="var(--accent-orange)" bgColor="var(--accent-orange-light)" subtitle="Require attention" />
      <StatCard label="Doctors on Duty" value={4} icon={Stethoscope} color="var(--accent-green)" bgColor="var(--accent-green-light)" subtitle="Active today" />
    </div>
  );
}
