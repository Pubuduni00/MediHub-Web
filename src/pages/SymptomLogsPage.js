import React, { useState } from 'react';
import { Activity, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import SymptomCard from '../components/symptoms/SymptomCard';
import EmptyState from '../components/common/EmptyState';
import './SymptomLogsPage.css';

export default function SymptomLogsPage() {
  const { symptomLogs } = useData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = symptomLogs
    .filter(l => {
      const q = search.toLowerCase();
      const matchSearch = l.patientName.toLowerCase().includes(q) || l.symptoms.some(s => s.toLowerCase().includes(q));
      const matchFilter = filter === 'All' || l.severity === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const counts = { Severe: symptomLogs.filter(l=>l.severity==='Severe').length, Moderate: symptomLogs.filter(l=>l.severity==='Moderate').length, Mild: symptomLogs.filter(l=>l.severity==='Mild').length };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Symptom Logs</h1>
          <p className="page-subtitle">{symptomLogs.length} patient-reported symptoms · {counts.Severe} critical</p>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Severe', count: counts.Severe, color: 'var(--accent-red)', bg: 'var(--accent-red-light)' },
          { label: 'Moderate', count: counts.Moderate, color: 'var(--accent-orange)', bg: 'var(--accent-orange-light)' },
          { label: 'Mild', count: counts.Mild, color: 'var(--accent-green)', bg: 'var(--accent-green-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: filter===s.label?`2px solid ${s.color}`:'1px solid var(--border)' }} onClick={() => setFilter(filter===s.label?'All':s.label)}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ width: 280 }}>
          <Activity size={13} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or symptom..." />
        </div>
        <Filter size={14} color="var(--text-muted)" />
        {['All','Severe','Moderate','Mild'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`}>{f}</button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={Activity} title="No symptom logs" message="Patient-reported symptoms will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(l => <SymptomCard key={l.id} log={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
