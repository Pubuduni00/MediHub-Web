import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const { patients } = useData();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 1) {
      const q = val.toLowerCase();
      const found = patients.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.phone||'').includes(q)
      ).slice(0, 6);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (patient) => {
    setQuery('');
    setResults([]);
    setFocused(false);
    navigate(`/patients/${patient.id}`);
  };

  const clear = () => { setQuery(''); setResults([]); };

  // Close on outside click
  const wrapperRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} style={{position:'relative'}}>
      <div className="search-bar" style={{width:280}}>
        <Search size={15} color="var(--text-muted)"/>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Search by Patient ID or name..."
          onFocus={()=>setFocused(true)}
        />
        {query && (
          <button onClick={clear} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',alignItems:'center'}}>
            <X size={13}/>
          </button>
        )}
      </div>

      {focused && results.length > 0 && (
        <div style={{
          position:'absolute',top:'calc(100% + 6px)',left:0,right:0,
          background:'var(--bg-white)',border:'1px solid var(--border)',
          borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',
          zIndex:300,overflow:'hidden'
        }}>
          {results.map(p => (
            <div
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',transition:'var(--transition)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <div className="avatar avatar-sm" style={{fontSize:10,flexShrink:0}}>
                {p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{p.name}</p>
                <p style={{fontSize:11.5,color:'var(--text-muted)'}}>{p.id} · {p.age}y · {p.gender}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
