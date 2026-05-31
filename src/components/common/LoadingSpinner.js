import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 16, md: 28, lg: 44 };
  const px = sizes[size] || sizes.md;

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: px + 16, height: px + 16,
        borderRadius: '50%',
        border: '3px solid var(--primary-light)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.7s linear infinite',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <HeartPulse size={px * 0.7} color="var(--primary)" />
      </div>
      {text && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      {spinner}
    </div>
  );
}
