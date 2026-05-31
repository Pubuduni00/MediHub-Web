import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'var(--primary)', bgColor = 'var(--primary-light)', change, changeSuffix = '', subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}{changeSuffix}
          </p>
        )}
        {subtitle && <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</p>}
      </div>
    </div>
  );
}
