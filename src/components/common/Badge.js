import React from 'react';

const variantMap = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  secondary: 'badge-secondary',
  muted: 'badge-muted',
  active: 'badge-success',
  inactive: 'badge-muted',
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-danger',
  normal: 'badge-success',
  abnormal: 'badge-danger',
};

export default function Badge({ label, variant = 'primary', dot = false }) {
  const cls = variantMap[variant?.toLowerCase()] || variantMap[label?.toLowerCase()] || 'badge-muted';
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className={`status-dot ${variant?.toLowerCase()}`} style={{ width: 6, height: 6, marginRight: 5 }} />}
      {label}
    </span>
  );
}
