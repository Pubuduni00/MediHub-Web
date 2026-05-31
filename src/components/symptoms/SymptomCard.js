import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Badge from '../common/Badge';

const SEVERITY_MAP = { Severe:'danger', Moderate:'warning', Mild:'success' };

export default function SymptomCard({ log }) {
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(new Date(log.date), { addSuffix: true });
  const severityVariant = SEVERITY_MAP[log.severity] || 'muted';

  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:14,
      padding:'14px 18px',
      borderRadius:'var(--radius-md)',
      border:'1px solid var(--border)',
      background:'var(--bg-white)',
      transition:'var(--transition)',
    }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
    >
      {/* Icon */}
      <div style={{
        width:40, height:40, borderRadius:'var(--radius-md)',
        background: log.severity==='Severe' ? 'var(--accent-red-light)' : log.severity==='Moderate' ? 'var(--accent-orange-light)' : 'var(--accent-green-light)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <Activity size={18} color={log.severity==='Severe'?'var(--accent-red)':log.severity==='Moderate'?'var(--accent-orange)':'var(--accent-green)'} />
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
          <div>
            <p style={{ fontWeight:600, fontSize:13.5, color:'var(--text-primary)', marginBottom:4 }}>{log.patientName}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:6 }}>
              {log.symptoms.map((s,i)=>(
                <span key={i} style={{
                  fontSize:12, padding:'2px 9px', borderRadius:20,
                  background:'var(--bg-base)', color:'var(--text-secondary)',
                  border:'1px solid var(--border)',
                }}>{s}</span>
              ))}
            </div>
            {log.notes && (
              <p style={{ fontSize:12.5, color:'var(--text-muted)', fontStyle:'italic', marginBottom:4 }}>"{log.notes}"</p>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{timeAgo}</span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>·</span>
              <span style={{ fontSize:11.5, background:'var(--bg-base)', padding:'1px 7px', borderRadius:10, color:'var(--text-secondary)' }}>via {log.reportedVia}</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
            <Badge label={log.severity} variant={severityVariant} />
            <button
              className="btn btn-outline btn-sm"
              onClick={()=>navigate(`/patients/${log.patientId}`)}
            >
              <Eye size={12}/> View Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
