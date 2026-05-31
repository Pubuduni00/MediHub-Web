import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard, Users, UserCheck, Calendar, Stethoscope,
  Bell, Activity, Settings, LogOut, ChevronLeft, ChevronRight,
  HeartPulse
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard',   label: 'Dashboard',             icon: LayoutDashboard, roles: ['staff','doctor'] },
  { path: '/patients',    label: 'Patient History',        icon: Users,           roles: ['staff','doctor'] },
  { path: '/my-patients', label: 'My Patients',            icon: UserCheck,       roles: ['doctor'] },
  { path: '/appointments',label: 'Appointments',           icon: Calendar,        roles: ['staff','doctor'] },
  { path: '/doctors',     label: 'Doctor List',            icon: Stethoscope,     roles: ['staff'] },
  { path: '/alerts',      label: 'Alerts & Notifications', icon: Bell,            roles: ['staff','doctor'] },
  { path: '/symptoms',    label: 'Symptom Logs',           icon: Activity,        roles: ['staff','doctor'] },
  { path: '/settings',    label: 'Settings',               icon: Settings,        roles: ['staff','doctor'] },
];

export default function Sidebar() {
  const { user, logout, isDoctor } = useAuth();
  const { unreadCount } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(i => i.roles.includes(user?.role));
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <HeartPulse size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">MediHub</span>
            <span className="sidebar-logo-tagline">Care Platform</span>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* ── User ── */}
      <div className="sidebar-user">
        <div className="avatar avatar-sm sidebar-avatar">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            : initials}
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">
              {isDoctor ? (user?.specialty || 'Doctor') : 'Staff'}
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {!collapsed && <p className="sidebar-section-label">MENU</p>}

        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            {/* Icon — with unread badge on alerts */}
            <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <item.icon size={18} className="sidebar-item-icon" />
              {item.path === '/alerts' && unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  background: 'var(--accent-red)', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  borderRadius: '50%', width: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>

            {!collapsed && (
              <span className="sidebar-item-label">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-item sidebar-logout"
          onClick={() => { logout(); navigate('/login'); }}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} className="sidebar-item-icon" />
          {!collapsed && <span className="sidebar-item-label">Logout</span>}
        </button>
      </div>

    </aside>
  );
}
