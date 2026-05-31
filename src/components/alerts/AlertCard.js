import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Info, AlertCircle, Eye, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDistanceToNow } from 'date-fns';

const ICONS = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Bell,
};
const COLORS = {
  danger: { bg: 'var(--accent-red-light)', icon: 'var(--accent-red)', border: '#FECACA' },
  warning: { bg: 'var(--accent-orange-light)', icon: 'var(--accent-orange)', border: '#FED7AA' },
  info: { bg: 'var(--primary-light)', icon: 'var(--primary)', border: '#BFDBFE' },
  default: { bg: 'var(--bg-base)', icon: 'var(--text-muted)', border: 'var(--border)' },
};

export default function AlertCard({ alert }) {
  const { markAlertRead } = useData();
  const navigate = useNavigate();

  const Icon = ICONS[alert.severity] || ICONS.default;
  const colors = COLORS[alert.severity] || COLORS.default;
  const timeAgo = formatDistanceToNow(new Date(alert.date), { addSuffix: true });

  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:14,
      padding:'14px 16px',
      borderRadius:'var(--radius-md)',
      border:`1px solid ${alert.read ? 'var(--border)' : colors.border}`,
      background: alert.read ? 'var(--bg-white)' : colors.bg,
      transition:'var(--transition)',
      opacity: alert.read ? 0.75 : 1,
    }}>
      {/* Icon */}
      <div style={{
        width:38, height:38, borderRadius:'var(--radius-md)', flexShrink:0,
        background: alert.read ? 'var(--bg-base)' : colors.bg,
        border:`1px solid ${colors.border}`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon size={18} color={alert.read ? 'var(--text-muted)' : colors.icon} />
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              {!alert.read && (
                <div style={{ width:7, height:7, borderRadius:'50%', background:colors.icon, flexShrink:0 }} />
              )}
              <p style={{ fontSize:13.5, fontWeight:alert.read?400:600, color:'var(--text-primary)' }}>
                {alert.message}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{alert.patientName}</span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>·</span>
              <span style={{ fontSize:11.5, background:'var(--bg-base)', padding:'1px 7px', borderRadius:10, color:'var(--text-secondary)' }}>{alert.type}</span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>·</span>
              <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{timeAgo}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={()=>{ markAlertRead(alert.id); navigate(`/patients/${alert.patientId}`); }}
            >
              <Eye size={12}/> View Patient
            </button>
            {!alert.read && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={()=>markAlertRead(alert.id)}
                title="Mark as read"
              >
                <Check size={12}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
