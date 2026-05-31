import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = '', action }) {
  return (
    <div className="empty-state">
      <Icon size={40} />
      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>{title}</p>
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
