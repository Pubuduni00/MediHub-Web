import React, { useState } from 'react';
import Modal from '../common/Modal';
import { UserCheck, UserX } from 'lucide-react';

const INACTIVE_REASONS = [
  'Patient stopped attending',
  'Patient requested discharge',
  'Transferred to another doctor',
  'Completed treatment',
  'Long absence — no contact',
  'Other',
];

export default function ChangeStatusModal({ isOpen, onClose, patient, onConfirm }) {
  const [reason, setReason] = useState(INACTIVE_REASONS[0]);
  const [notes, setNotes] = useState('');

  if (!patient) return null;

  const isActivating = patient.status === 'Inactive';
  const newStatus = isActivating ? 'Active' : 'Inactive';

  const handleConfirm = () => {
    onConfirm(patient.id, newStatus, reason, notes);
    setReason(INACTIVE_REASONS[0]);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setReason(INACTIVE_REASONS[0]);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isActivating ? 'Reactivate Patient' : 'Mark Patient as Inactive'}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
          <button
            className={`btn ${isActivating ? 'btn-success' : 'btn-danger'}`}
            onClick={handleConfirm}
          >
            {isActivating
              ? <><UserCheck size={14}/> Mark Active</>
              : <><UserX size={14}/> Mark Inactive</>
            }
          </button>
        </>
      }
    >
      {/* Patient info */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-base)', borderRadius:'var(--radius-md)', marginBottom:18 }}>
        <div className="avatar" style={{ background: isActivating ? 'var(--accent-green-light)' : 'var(--accent-red-light)', color: isActivating ? 'var(--accent-green)' : 'var(--accent-red)', width:40, height:40, fontSize:14 }}>
          {patient.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <div>
          <p style={{ fontWeight:600, fontSize:14 }}>{patient.name}</p>
          <p style={{ fontSize:12, color:'var(--text-muted)' }}>{patient.id} · Currently <strong>{patient.status}</strong></p>
        </div>
      </div>

      {/* Info box */}
      <div style={{
        padding:'10px 14px', borderRadius:'var(--radius-md)', marginBottom:18,
        background: isActivating ? 'var(--accent-green-light)' : 'var(--accent-red-light)',
        border: `1px solid ${isActivating ? '#BBF7D0' : '#FECACA'}`,
        fontSize:13, color: isActivating ? 'var(--accent-green)' : 'var(--accent-red)',
        display:'flex', alignItems:'center', gap:8,
      }}>
        {isActivating
          ? <><UserCheck size={14}/> Patient will be moved back to your active list.</>
          : <><UserX size={14}/> Patient will be moved to your inactive list. Records are kept.</>
        }
      </div>

      {/* Reason — only when inactivating */}
      {!isActivating && (
        <div className="form-group">
          <label className="form-label">Reason</label>
          <select className="form-control" value={reason} onChange={e=>setReason(e.target.value)}>
            {INACTIVE_REASONS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
      )}

      <div className="form-group" style={{ margin:0 }}>
        <label className="form-label">Notes <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
        <textarea className="form-control" rows={2}
          value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder={isActivating ? 'Reason for reactivating...' : 'Any additional notes...'}
        />
      </div>
    </Modal>
  );
}
