
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AuthForm.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Reset form fields when switching modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
  };

  // Reset forgot password state
  const handleForgotSwitch = (showForgot) => {
    setForgot(showForgot);
    setForgotEmail('');
    setForgotMsg('');
    setError(null);
  };

  // Validation
  const validate = () => {
    if (mode === 'register' && !name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!password.trim()) return 'Password is required.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const url = `${API}/auth/${mode}`;
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const res = await axios.post(url, payload);
      onSuccess(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    if (!forgotEmail.trim()) {
      setForgotMsg('Email is required.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot`, { email: forgotEmail });
      setForgotMsg('If your email exists, a reset link has been sent.');
    } catch (err) {
      setForgotMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-lamp" aria-hidden>
        <svg viewBox="0 0 333 484" className="lamp-svg" xmlns="http://www.w3.org/2000/svg" fill="none">
          <ellipse cx="165" cy="220" rx="130" ry="20" fill="var(--primary-light)" opacity="0.06" />
          <path d="M165 464c44 0 80-9 80-20v-14h-160v14c0 11 35 20 80 20z" fill="var(--primary)" opacity="0.08" />
        </svg>
      </div>
      <div className="auth-form-card">
        {!forgot ? (
          <form className="auth-form" onSubmit={submit}>
            <h2 className="auth-title">{mode === 'login' ? 'Login to Taskmaster Pro' : 'Register for Taskmaster Pro'}</h2>
            {mode === 'register' ? (
              <>
                <div className="field">
                  <label>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="new-password" />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password" />
                </div>
              </>
            )}
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
            <div className="form-footer">
              <button
                type="button"
                className="link"
                onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Create account' : 'Have an account? Login'}
              </button>
              {mode === 'login' && (
                <button type="button" className="link" onClick={() => handleForgotSwitch(true)}>Forgot Password?</button>
              )}
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleForgot}>
            <h2 className="auth-title">Forgot Password</h2>
            <div className="field">
              <label>Email</label>
              <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" />
            </div>
            {forgotMsg && <div className="auth-error">{forgotMsg}</div>}
            <button type="submit" disabled={loading} className="login-btn">Send Reset Link</button>
            <div className="form-footer">
              <button type="button" className="link" onClick={() => handleForgotSwitch(false)}>Back to Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
