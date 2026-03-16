import React, { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ForgotPassword({ onDone }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API}/auth/forgot`, { email });
      setSent(true);
      if (onDone) onDone();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container">
      <div className="login-form active">
      {!sent ? (
        <>
          <h2>Reset your password</h2>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="fp-email">Email</label>
              <input id="fp-email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </div>
            <button type="submit" className="login-btn">Send Reset Email</button>
          </form>
        </>
      ) : (
        <>
          <h2>Check your email</h2>
          <p style={{ color: '#e2e8f0' }}>If an account exists for that email, we sent a reset link.</p>
          <div className="form-footer">
            <button type="button" className="forgot-link" onClick={onDone}>Back to Login</button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
