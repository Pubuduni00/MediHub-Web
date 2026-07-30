import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Clock, AlertCircle, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const API = 'http://localhost:5000';

// ── Helper ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), 'MMM dd, yyyy'); } catch { return dateStr; }
}
function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return timeStr; }
}

// ── Action Modals ────────────────────────────────────────────────────────────
function RejectModal({ request, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');
  const preview = reason.trim()
    ? `Your rescheduling request could not be approved because ${reason.trim()}.`
    : 'Your rescheduling request has been rejected.';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ color: 'var(--accent-red)' }}>Reject Reschedule Request</h3>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              Patient: <strong style={{ color: 'var(--text)' }}>{request.patientName}</strong>
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Requested: <strong style={{ color: 'var(--text)' }}>{formatDate(request.requestedDate)} {formatTime(request.requestedTime)}</strong>
            </p>
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Reason for rejection (optional)
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="e.g. the requested slot conflicts with another critical appointment"
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ resize: 'vertical', fontSize: 13 }}
          />
          <div style={{
            marginTop: 12, padding: '10px 12px', background: 'var(--surface-variant, #f5f5f5)',
            borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
            borderLeft: '3px solid var(--accent-red)'
          }}>
            <strong>Message to patient:</strong><br />{preview}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
          >
            {loading ? 'Rejecting...' : <><X size={14} style={{ marginRight: 4 }} />Reject Request</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveConfirmModal({ request, onConfirm, onClose, loading }) {
  const message = `Your rescheduling request has been approved. Your new appointment is scheduled for ${formatDate(request.requestedDate)} at ${formatTime(request.requestedTime)}.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Approval</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            You are about to approve the reschedule request for <strong>{request.patientName}</strong>.
            The appointment will be moved to:
          </p>
          <div style={{
            padding: '10px 14px', background: 'var(--primary-light, #e8f4f8)',
            borderRadius: 8, marginBottom: 12, fontWeight: 600, fontSize: 14
          }}>
            {formatDate(request.requestedDate)} at {formatTime(request.requestedTime)}
          </div>
          <div style={{
            padding: '10px 12px', background: 'var(--surface-variant, #f5f5f5)',
            borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
            borderLeft: '3px solid var(--primary)'
          }}>
            <strong>Message to patient:</strong><br />{message}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? 'Approving...' : <><Check size={14} style={{ marginRight: 4 }} />Confirm Approval</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestModal({ request, onConfirm, onClose, loading }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customMsg, setCustomMsg] = useState('');

  // Group slots by date
  const slotsByDate = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s.time);
    return acc;
  }, {});

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch doctor availability (includes isBooked calculation from server)
        const res = await fetch(`${API}/api/doctors/${encodeURIComponent(request.doctorId)}/availability`);
        const data = res.ok ? await res.json() : [];

        // The current appointment slot is excluded (staff can't suggest same slot)
        const currentKey = `${request.oldDate}_${request.oldTime}`;

        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const free = data
          .filter(s => {
            if (s.date < todayStr) return false;
            if (s.date === todayStr && s.time <= currentTimeStr) return false;
            return !s.isBooked && `${s.date}_${s.time}` !== currentKey;
          })
          .map(s => ({ date: s.date, time: s.time }));

        setSlots(free);
      } catch (err) {
        console.error('Error loading slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [request]);

  const preview = selectedSlot
    ? (customMsg.trim() || `The doctor is not available at your requested time. The doctor is available on ${formatDate(selectedSlot.date)} at ${formatTime(selectedSlot.time)}.`)
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Suggest Another Time</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Select an alternative available slot to suggest to <strong>{request.patientName}</strong>.
          </p>

          {loadingSlots ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Loading available slots...</p>
          ) : slots.length === 0 ? (
            <div style={{ padding: '16px', background: '#fff3cd', borderRadius: 8, color: '#856404', fontSize: 13 }}>
              <AlertCircle size={14} style={{ marginRight: 6 }} />
              No other available slots found for this doctor. Add availability from the Appointments page first.
            </div>
          ) : (
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              {Object.entries(slotsByDate).map(([date, times]) => (
                <div key={date}>
                  <div style={{
                    padding: '6px 12px', background: 'var(--surface-variant, #f5f5f5)',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)', textTransform: 'uppercase'
                  }}>
                    <Calendar size={11} style={{ marginRight: 4 }} />
                    {formatDate(date)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px' }}>
                    {times.map(time => {
                      const isSelected = selectedSlot?.date === date && selectedSlot?.time === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedSlot({ date, time })}
                          style={{
                            padding: '4px 10px', borderRadius: 6, fontSize: 12,
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            background: isSelected ? 'var(--primary)' : 'var(--surface)',
                            color: isSelected ? '#fff' : 'var(--text)',
                            cursor: 'pointer', fontWeight: isSelected ? 600 : 400
                          }}
                        >
                          {formatTime(time)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSlot && (
            <>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Custom message (optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Leave blank to use the default message"
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  style={{ resize: 'vertical', fontSize: 13 }}
                />
              </div>
              <div style={{
                marginTop: 10, padding: '10px 12px', background: 'var(--surface-variant, #f5f5f5)',
                borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
                borderLeft: '3px solid var(--warning, #ff9800)'
              }}>
                <strong>Message to patient:</strong><br />{preview}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(selectedSlot, customMsg.trim())}
            disabled={loading || !selectedSlot}
            style={{ opacity: !selectedSlot ? 0.5 : 1 }}
          >
            {loading ? 'Sending...' : <><MessageSquare size={14} style={{ marginRight: 4 }} />Send Suggestion</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function RescheduleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // { type: 'approve'|'reject'|'suggest', request }
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/api/reschedule-requests`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.filter(r => r.status === 'Pending'));
    } catch (err) {
      console.error(err);
      setError('Failed to load reschedule requests. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const closeModal = () => setActiveModal(null);

  // Approve
  const handleApprove = async () => {
    const req = activeModal.request;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/reschedule-requests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          alert(`⚠️ ${data.message || 'The requested slot is no longer available. Please suggest an alternative time.'}`);
          closeModal();
          return;
        }
        throw new Error(data.error || 'Failed to approve');
      }
      setRequests(prev => prev.filter(r => r.id !== req.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to approve request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject
  const handleReject = async (reason) => {
    const req = activeModal.request;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/reschedule-requests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', staffMessage: reason || undefined })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to reject'); }
      setRequests(prev => prev.filter(r => r.id !== req.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to reject request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Suggest
  const handleSuggest = async (slot, customMsg) => {
    if (!slot) return;
    const req = activeModal.request;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/reschedule-requests/${req.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'AlternativeSuggested',
          suggestedDate: slot.date,
          suggestedTime: slot.time,
          staffMessage: customMsg || undefined
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to send suggestion'); }
      setRequests(prev => prev.filter(r => r.id !== req.id));
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to send suggestion: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Reschedule Requests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Review and respond to patient appointment reschedule requests.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchRequests} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--accent-red)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchRequests} style={{ marginTop: 12 }}>Retry</button>
          </div>
        ) : loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Clock size={40} color="var(--border)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No pending reschedule requests</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>New requests from patients will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Current Appointment</th>
                  <th>Requested Slot</th>
                  <th>Patient's Reason</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    {/* Patient */}
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.patientName}</div>
                      {req.patientPhone && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.patientPhone}</div>
                      )}
                    </td>

                    {/* Doctor */}
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{req.doctorName}</td>

                    {/* Current slot */}
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatDate(req.oldDate)} {formatTime(req.oldTime)}
                      </div>
                    </td>

                    {/* Requested slot */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {req.requestedDate ? (
                          <>{formatDate(req.requestedDate)} {formatTime(req.requestedTime)}</>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Not specified</span>
                        )}
                      </div>
                    </td>

                    {/* Reason */}
                    <td style={{ maxWidth: 200 }}>
                      {req.reason ? (
                        <span style={{
                          fontSize: 12, color: 'var(--text)',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }} title={req.reason}>
                          {req.reason}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No reason given</span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {req.createdAt ? format(new Date(req.createdAt), 'MMM dd, yyyy HH:mm') : '—'}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                        {/* Approve */}
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setActiveModal({ type: 'approve', request: req })}
                          title={!req.requestedDate ? 'No requested slot to approve' : 'Approve this request'}
                          disabled={!req.requestedDate}
                          style={{
                            padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4,
                            opacity: !req.requestedDate ? 0.5 : 1, fontSize: 12
                          }}
                        >
                          <Check size={13} /> Approve
                        </button>

                        {/* Suggest */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setActiveModal({ type: 'suggest', request: req })}
                          style={{
                            padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4,
                            color: 'var(--primary)', fontSize: 12
                          }}
                          title="Suggest an alternative time slot"
                        >
                          <Calendar size={13} /> Suggest
                        </button>

                        {/* Reject */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setActiveModal({ type: 'reject', request: req })}
                          style={{
                            padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4,
                            color: 'var(--accent-red)', fontSize: 12
                          }}
                          title="Reject this request"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal?.type === 'approve' && (
        <ApproveConfirmModal
          request={activeModal.request}
          onConfirm={handleApprove}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}
      {activeModal?.type === 'reject' && (
        <RejectModal
          request={activeModal.request}
          onConfirm={handleReject}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}
      {activeModal?.type === 'suggest' && (
        <SuggestModal
          request={activeModal.request}
          onConfirm={handleSuggest}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
