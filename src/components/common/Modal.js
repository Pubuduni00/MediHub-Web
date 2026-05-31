import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', noPadding = false }) {
  const widths = { sm: 420, md: 560, lg: 760, xl: 960, full: '95vw' };
  const w = widths[size] || widths.md;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: w }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className={noPadding ? '' : 'modal-body'}>
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
