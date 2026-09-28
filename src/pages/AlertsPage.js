import React, { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import AlertCard from '../components/alerts/AlertCard';
import EmptyState from '../components/common/EmptyState';
import './AlertsPage.css';

export default function AlertsPage() {
  const { isDoctor, user } = useAuth();
  const { alerts, patients, markAlertRead, markAllAlertsRead } = useData();
  const [filter, setFilter] = useState('All');

  const doctorPatientIds = new Set(
    patients
      .filter(patient => patient.assignedDoctors?.some(doctorId => String(doctorId) === String(user?.id)))
      .map(patient => String(patient.id))
  );
  const visibleAlerts = isDoctor
    ? alerts.filter(alert => doctorPatientIds.has(String(alert.patientId)))
    : alerts;
  const unreadCount = visibleAlerts.filter(alert => !alert.read).length;

  const filtered = visibleAlerts
    .filter(a => {
      if (filter==='Unread') return !a.read;
      if (filter==='danger') return a.severity==='danger';
      if (filter==='warning') return a.severity==='warning';
      if (filter==='info') return a.severity==='info';
      return true;
    })
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const markVisibleAlertsRead = () => {
    if (!isDoctor) {
      markAllAlertsRead();
      return;
    }
    visibleAlerts.filter(alert => !alert.read).forEach(alert => markAlertRead(alert.id));
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:12}}>
        <p style={{fontSize:13.5,color:'var(--text-muted)'}}>{unreadCount} unread · {visibleAlerts.length} total</p>
        {unreadCount>0&&<button className="btn btn-ghost btn-sm" onClick={markVisibleAlertsRead}><CheckCheck size={14}/> Mark All Read</button>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18,flexWrap:'wrap'}}>
        <Filter size={14} color="var(--text-muted)"/>
        {[{val:'All',label:'All'},{val:'Unread',label:`Unread (${unreadCount})`},{val:'danger',label:'Critical'},{val:'warning',label:'Warning'},{val:'info',label:'Info'}].map(f=>(
          <button key={f.val} onClick={()=>setFilter(f.val)} className={`btn btn-sm ${filter===f.val?'btn-primary':'btn-ghost'}`}>{f.label}</button>
        ))}
      </div>
      <div className="card">
        {filtered.length===0
          ? <EmptyState icon={Bell} title="No alerts" message="You're all caught up!"/>
          : <div style={{display:'flex',flexDirection:'column',gap:8}}>{filtered.map(a=><AlertCard key={a.id} alert={a}/>)}</div>
        }
      </div>
    </div>
  );
}
