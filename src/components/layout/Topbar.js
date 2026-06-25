import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import SearchBar from '../common/SearchBar';
import Avatar from '../common/Avatar';
import './Topbar.css';

const pageTitles = {
  '/dashboard':   { title:'Dashboard',              sub:'Overview & insights' },
  '/patients':    { title:'Patient History',         sub:'All registered patients' },
  '/my-patients': { title:'My Patients',             sub:'Patients under your care' },
  '/appointments':{ title:'Appointments',            sub:'Schedule & calendar' },
  '/doctors':     { title:'Doctor List',             sub:'Manage medical staff' },
  '/alerts':      { title:'Alerts & Notifications',  sub:'Recent activity' },
  '/symptoms':    { title:'Symptom Logs',            sub:'Patient-reported symptoms' },
  '/settings':    { title:'Settings',                sub:'Account & preferences' },
};

export default function Topbar() {
  const { user } = useAuth();
  const { unreadCount } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const base = '/' + location.pathname.split('/')[1];
  const page = pageTitles[base] || { title:'MediHub', sub:'' };
  const isPatientProfile = location.pathname.startsWith('/patients/') && location.pathname.length > 10;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{isPatientProfile ? 'Patient Profile' : page.title}</span>
        <span className="topbar-breadcrumb">{isPatientProfile ? 'Patient details & history' : page.sub}</span>
      </div>
      <div className="topbar-right">
        <SearchBar />
        <button className="topbar-icon-btn" onClick={()=>navigate('/alerts')} title="Alerts">
          <Bell size={17}/>
          {unreadCount>0 && <span className="topbar-badge">{unreadCount>9?'9+':unreadCount}</span>}
        </button>
        <div className="topbar-divider"/>
        <div className="topbar-user" onClick={()=>navigate('/settings')}>
          <div className="topbar-user-info">
            <p className="topbar-user-name">{user?.name}</p>
            <p className="topbar-user-role">{user?.role==='doctor'?(user?.specialty||'Doctor'):'Staff'}</p>
          </div>
          <Avatar name={user?.name} src={user?.avatar} size="sm"/>
        </div>
      </div>
    </header>
  );
}
