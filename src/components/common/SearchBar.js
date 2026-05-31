import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export default function SearchBar({ placeholder = 'Search by Patient ID or name...', onSearch, standalone = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const { patients } = useData();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val);

    if (val.trim().length >= 1) {
      const q = val.toLowerCase();
      const found = patients.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
      ).slice(0, 5);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (patient) => {
    setQuery('');
    setResults([]);
    navigate(`/patients/${patient.id}`);
  };

  const clear = () => { setQuery(''); setResults([]); if (onSearch) onSearch(''); };

  return (
    <div style={{ position: 'relative' }}>
      <div className="search-bar" style={{ width: standalone ? 300 : 260 }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {focused && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          zIndex: 200, overflow: 'hidden'
        }}>
          {results.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', cursor: 'pointer', transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar avatar-sm" style={{ fontSize: 10 }}>
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.id} · {p.age}y · {p.gender}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
