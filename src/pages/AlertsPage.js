import React, { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import AlertCard from '../components/alerts/AlertCard';
import EmptyState from '../components/common/EmptyState';
import './AlertsPage.css';

export default function AlertsPage() {
  const { alerts, markAllAlertsRead, unreadCount } = useData();
  const [filter, setFilter] = useState('All');

  const filtered = alerts
    .filter(a => {
      if (filter === 'Unread') return !a.read;
      if (filter === 'danger') return a.severity === 'danger';
      if (filter === 'warning') return a.severity === 'warning';
      if (filter === 'info') return a.severity === 'info';
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread · {alerts.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllAlertsRead}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <Filter size={14} color="var(--text-muted)" />
        {[
          { val: 'All', label: 'All' },
          { val: 'Unread', label: `Unread (${unreadCount})` },
          { val: 'danger', label: 'Critical' },
          { val: 'warning', label: 'Warning' },
          { val: 'info', label: 'Info' },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)} className={`btn btn-sm ${filter === f.val ? 'btn-primary' : 'btn-ghost'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={Bell} title="No alerts" message="You're all caught up!" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
