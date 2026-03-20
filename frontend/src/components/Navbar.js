import React, { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Palette, Zap, FileText, Search, Shield, Crown, LogOut, User, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ currentPage, onNavigate, onReset }) => {
  const { theme, setTheme }       = useTheme();
  const { user, signOut }         = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showUser,  setShowUser]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSignOut = () => {
    signOut();
    onReset && onReset();
    onNavigate('home');
    setShowUser(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">

        {/* Logo */}
        <button className="navbar-logo" onClick={() => { onReset && onReset(); onNavigate('home'); }}>
          <span className="logo-icon"><Zap size={18} /></span>
          <span className="logo-text">Resume<span className="logo-accent">IQ</span></span>
        </button>

        {/* Nav links */}
        <div className="navbar-links">
          <button
            className={`nav-link ${(currentPage === 'home' || currentPage === 'results') ? 'active' : ''}`}
            onClick={() => { onReset && onReset(); onNavigate('home'); }}
          >
            <Search size={14} /> Analyzer
          </button>
          <button
            className={`nav-link ${currentPage === 'builder' ? 'active' : ''}`}
            onClick={() => onNavigate('builder')}
          >
            <FileText size={14} /> Resume Builder
          </button>
          {user?.is_admin && (
            <button
              className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
            >
              <Shield size={14} /> Admin
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Theme switcher */}
          <div className="theme-switcher">
            <button className="btn btn-ghost theme-btn" onClick={() => { setShowTheme(v => !v); setShowUser(false); }}>
              <Palette size={16} />
              <span className="theme-label">{THEMES[theme]?.label}</span>
            </button>
            {showTheme && (
              <>
                <div className="theme-overlay" onClick={() => setShowTheme(false)} />
                <div className="theme-menu">
                  <p className="theme-menu-title">Choose Theme</p>
                  {Object.values(THEMES).map(t => (
                    <button key={t.name} className={`theme-option ${theme === t.name ? 'active' : ''}`}
                      onClick={() => { setTheme(t.name); setShowTheme(false); }}>
                      <span className={`theme-swatch theme-swatch-${t.name}`} />
                      {t.label}
                      {theme === t.name && <span className="theme-check">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User menu or Sign In */}
          {user ? (
            <div className="user-menu-wrap">
              <button className="user-menu-btn" onClick={() => { setShowUser(v => !v); setShowTheme(false); }}>
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                <span className="user-name-short">{user.name.split(' ')[0]}</span>
                {(user.is_subscribed || user.is_admin) && (
                  <Crown size={12} className="user-crown" />
                )}
                <ChevronDown size={13} />
              </button>
              {showUser && (
                <>
                  <div className="theme-overlay" onClick={() => setShowUser(false)} />
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{user.name}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                      <span className={`user-plan-badge ${user.is_admin ? 'admin' : user.is_subscribed ? 'pro' : 'free'}`}>
                        {user.is_admin ? '🛡 Admin' : user.is_subscribed ? '👑 Pro' : '🆓 Free'}
                      </span>
                    </div>
                    <div className="user-dropdown-divider" />
                    {user.is_admin && (
                      <button className="user-dropdown-item" onClick={() => { onNavigate('admin'); setShowUser(false); }}>
                        <Shield size={13} /> Admin Panel
                      </button>
                    )}
                    <button className="user-dropdown-item signout" onClick={handleSignOut}>
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('auth')}>
              <User size={14} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
