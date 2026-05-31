import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './styles/globals.css';

// Replace with your real Google Client ID when ready
const GOOGLE_CLIENT_ID = '567314274032-3fstjj1dbnc53kge7m0qr5l2mrftogcj.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
