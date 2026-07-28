import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, isDoctor, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ appointments: true, alerts: true, symptoms: true, reports: false });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialtyOrDept, setSpecialtyOrDept] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setSpecialtyOrDept(isDoctor ? user.specialty || '' : user.department || '');
    }
  }, [user, isDoctor]);

  const handleSave = async () => {
    const updates = { name, email };
    if (isDoctor) {
      updates.specialty = specialtyOrDept;
    }
    const res = await updateUserProfile(updates);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
        {saved && <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: 13 }}>✓ Changes saved</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 10 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontSize: 13.5, fontWeight: activeTab === t.id ? 600 : 400,
                background: activeTab === t.id ? 'var(--primary-light)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition)', marginBottom: 2,
              }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'profile' && (
            <div>
              <div className="card-header"><h3 className="card-title">Profile Information</h3></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, padding: '16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
                <Avatar name={user?.name} src={user?.avatar} size="xl" />
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
                  <span className="badge badge-primary" style={{ marginTop: 6 }}>{isDoctor ? user?.specialty || 'Doctor' : 'Staff'}</span>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                {isDoctor && (
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={specialtyOrDept} 
                      onChange={e => setSpecialtyOrDept(e.target.value)} 
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={user?.id || ''} 
                    disabled 
                    style={{ background: 'var(--bg-base)', cursor: 'not-allowed' }} 
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Save Changes</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="card-header"><h3 className="card-title">Notification Preferences</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { key: 'alerts', label: 'Patient alerts', desc: 'Receive alerts for critical patient events' },
                  { key: 'symptoms', label: 'Symptom reports', desc: 'Be notified when patients report symptoms' },
                  { key: 'reports', label: 'Report generation', desc: 'Notifications when reports are ready' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</p>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <div onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                      style={{ width: 44, height: 24, borderRadius: 12, background: notifs[item.key] ? 'var(--primary)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifs[item.key] ? 23 : 3, transition: 'var(--transition)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary mt-4" onClick={handleSave}><Save size={14} /> Save Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="card-header"><h3 className="card-title">Security Settings</h3></div>
              <div style={{ background: 'var(--primary-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 20 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
                  {isDoctor ? '🔐 Google Account Authentication' : '🔑 Password Authentication'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isDoctor ? 'Your account is secured via Google OAuth. Password changes are managed through your Google account.' : 'Your account uses password authentication. Change it below.'}
                </p>
              </div>
              {!isDoctor && (
                <div>
                  {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
                    <div key={i} className="form-group">
                      <label className="form-label">{label}</label>
                      <input type="password" className="form-control" placeholder="••••••••" />
                    </div>
                  ))}
                  <button className="btn btn-primary" onClick={handleSave}><Lock size={14} /> Update Password</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
