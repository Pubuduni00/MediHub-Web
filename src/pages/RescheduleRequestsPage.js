import React, { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function RescheduleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/reschedule-requests');
      const data = await res.json();
      // Only show pending requests
      setRequests(data.filter(r => r.status === 'Pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reschedule-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update request');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Reschedule Requests</h2>
      
      <div className="card" style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Clock size={40} color="var(--border)" style={{ margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No pending reschedule requests.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Current Slot</th>
                  <th>Requested Slot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600 }}>{req.patientName}</td>
                    <td>{req.doctorName}</td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{textDecoration: 'line-through'}}>{format(parseISO(req.oldDate), 'MMM dd, yyyy')} {req.oldTime}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {format(parseISO(req.requestedDate), 'MMM dd, yyyy')} {req.requestedTime}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleAction(req.id, 'Approved')}
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => handleAction(req.id, 'Rejected')}
                          style={{ padding: '4px 8px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <X size={14} /> Reject
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
    </div>
  );
}
