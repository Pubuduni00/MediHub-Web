import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import Avatar from '../components/common/Avatar';

export default function LockPage() {
  const { user, loginStaff, isDoctor, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = await loginStaff(user?.email, password);
    if (result.success) navigate('/dashboard');
    else setError('Incorrect password. Please try again.');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#0D2137,#0A6EBD)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.25)', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>MediHub</span>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="xl" />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Session Locked'}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{user?.email}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 24, color: 'var(--text-muted)' }}>
          <Lock size={15} />
          <span style={{ fontSize: 13.5 }}>Session locked. Verify your identity to continue.</span>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-red-light)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '9px 14px', fontSize: 13, color: 'var(--accent-red)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {isDoctor ? (
          <GoogleLoginButton />
        ) : (
          <form onSubmit={handleUnlock}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingRight: 42, textAlign: 'center', letterSpacing: '0.1em' }}
                required
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Unlocking...' : 'Unlock Session'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login'); }} style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
            Sign in as a different user
          </button>
        </div>
      </div>
    </div>
  );
}
