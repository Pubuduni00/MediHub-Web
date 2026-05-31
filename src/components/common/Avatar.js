import React from 'react';

export default function Avatar({ name = '', src, size = 'md', color }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : '';
  const style = color ? { background: color } : {};

  return (
    <div className={`avatar ${sizeClass}`} style={style}>
      {src
        ? <img src={src} alt={name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        : initials
      }
    </div>
  );
}
