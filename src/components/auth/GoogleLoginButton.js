import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton() {
  const { loginDoctor } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user profile from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await res.json();
        // profile contains: name, email, picture, sub
        const result = loginDoctor(profile);
        if (result.success) navigate('/dashboard');
        else setError('Your Google account is not registered as a doctor.');
      } catch {
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login was cancelled or failed.');
      setLoading(false);
    }
  });

  return (
    <div>
      <button
        onClick={() => { setError(''); login(); }}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '11px 20px',
          background: '#fff',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 14, fontWeight: 500,
          color: 'var(--text-primary)',
          transition: 'var(--transition)',
          opacity: loading ? 0.7 : 1,
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        {/* Google G icon */}
        {loading ? (
          <div style={{ width: 20, height: 20, border: '2px solid #ddd', borderTopColor: '#4285f4', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <p style={{
          marginTop: 10, fontSize: 12.5, color: 'var(--accent-red)',
          textAlign: 'center', background: 'var(--accent-red-light)',
          padding: '7px 12px', borderRadius: 'var(--radius-sm)'
        }}>{error}</p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
