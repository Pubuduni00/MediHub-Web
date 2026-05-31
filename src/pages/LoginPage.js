import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, Users, Shield, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import './LoginPage.css';

export default function LoginPage() {
  const { user, loginStaff } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = loginStaff(email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon"><HeartPulse size={26} color="#fff" /></div>
          <div>
            <p className="login-brand-name">MediHub</p>
            <p className="login-brand-tagline">CARE PLATFORM</p>
          </div>
        </div>
        <div className="login-hero-text">
          <h1>Continuity of care,<br />designed for<br /><em>every patient.</em></h1>
          <p>A unified telemedical platform connecting doctors, staff, and patients for seamless follow-up care.</p>
        </div>
        <div className="login-features">
          {[
            { icon: Stethoscope, text: 'Comprehensive patient history & clinical logs' },
            { icon: Users, text: 'Multi-doctor patient management' },
            { icon: Shield, text: 'Secure, role-based access control' },
          ].map((f, i) => (
            <div key={i} className="login-feature-item">
              <f.icon size={17} />
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Welcome back</h2>
          <p className="login-card-sub">Sign in to your MediHub account</p>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button className={`role-tab ${role === 'doctor' ? 'active' : ''}`} onClick={() => { setRole('doctor'); setError(''); }}>
              <Stethoscope size={15} /> Doctor
            </button>
            <button className={`role-tab ${role === 'staff' ? 'active' : ''}`} onClick={() => { setRole('staff'); setError(''); }}>
              <Users size={15} /> Staff
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Doctor: Google Auth */}
          {role === 'doctor' && (
            <div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Doctors sign in using their hospital Google account. Contact administration if you don't have access.
              </p>
              <GoogleLoginButton />
              <div className="divider-text" style={{ marginTop: 20 }}>
                <span>Demo access</span>
              </div>
              <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> For demo, clicking "Continue with Google" will log you in as Dr. Amara Patel. Replace with your Google Client ID for production.
                </p>
              </div>
            </div>
          )}

          {/* Staff: Credentials */}
          {role === 'staff' && (
            <form onSubmit={handleStaffLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="staff@medihub.com"
                    style={{ paddingLeft: 38 }}
                    required
                  />
                  <Users size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ paddingLeft: 38, paddingRight: 40 }}
                    required
                  />
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)', marginTop: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}><strong>Demo credentials:</strong></p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>admin@medihub.com / Staff@1234</p>
              </div>
            </form>
          )}

          <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Having trouble signing in? Contact{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>IT Support</span>
          </p>
        </div>
      </div>
    </div>
  );
}
