import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import './AuthPage.css';

const AuthPage = ({ onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [tab,      setTab]     = useState('signin');   // 'signin' | 'signup'
  const [name,     setName]    = useState('');
  const [email,    setEmail]   = useState('');
  const [password, setPassword]= useState('');
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const reset = (newTab) => {
    setTab(newTab); setError(''); setName(''); setEmail(''); setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'signup') {
        await signUp(name, email, password);
      } else {
        await signIn(email, password);
      }
      onSuccess && onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-mesh" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon"><Zap size={20} /></span>
          <span className="auth-logo-text">Resume<span>IQ</span></span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => reset('signin')}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => reset('signup')}>
            Sign Up
          </button>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>{tab === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p>{tab === 'signin' ? 'Sign in to access your resume dashboard' : 'Join thousands getting AI resume feedback'}</p>
        </div>

        {/* Admin hint (only visible on sign-in tab) */}
        {tab === 'signin' && (
          <div className="auth-admin-hint">
            <Shield size={13} />
            Admin? Use your admin credentials to sign in.
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Akshay Solanke"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={tab === 'signin'}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-pw-wrap">
              <input
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder={tab === 'signup' ? 'Min 6 characters' : 'Your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><Loader2 size={18} className="spin" /> {tab === 'signup' ? 'Creating account...' : 'Signing in...'}</>
              : tab === 'signup' ? 'Create Account' : 'Sign In'
            }
          </button>
        </form>

        {/* Switch tab */}
        <p className="auth-switch">
          {tab === 'signin'
            ? <>Don't have an account? <button onClick={() => reset('signup')}>Sign up free</button></>
            : <>Already have an account? <button onClick={() => reset('signin')}>Sign in</button></>
          }
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
