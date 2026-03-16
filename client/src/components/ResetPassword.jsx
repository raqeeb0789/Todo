import React, { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ResetPassword({ tokenFromUrl, emailFromUrl, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/auth/reset`, { token: tokenFromUrl, email: emailFromUrl, password });
      setMsg('Password reset successful. You can now login.');
      if (onDone) onDone();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-form active">
        <h2>Set a new password</h2>
        {error && <div className="auth-error">{error}</div>}
        {msg && <div className="auth-error" style={{ background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.25)', color: '#86efac' }}>{msg}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="rp-password">New Password</label>
            <input id="rp-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label htmlFor="rp-confirm">Confirm Password</label>
            <input id="rp-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Set Password'}</button>
        </form>
        <div className="form-footer">
          <button type="button" className="forgot-link" onClick={onDone}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}
