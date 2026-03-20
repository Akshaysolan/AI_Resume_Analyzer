import React, { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar        from './components/Navbar';
import UploadSection from './components/UploadSection';
import ResultsDashboard from './components/ResultsDashboard';
import ResumeBuilder from './components/builder/ResumeBuilder';
import AdminPanel    from './components/builder/AdminPanel';
import AuthPage      from './pages/AuthPage';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorBanner   from './components/ErrorBanner';
import { analyzeResume } from './services/api';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [page,      setPage]     = useState('home');
  const [result,    setResult]   = useState(null);
  const [analyzing, setAnalyzing]= useState(false);
  const [error,     setError]    = useState('');

  const handleAnalyze = useCallback(async (file, jobDescription) => {
    setError('');
    setAnalyzing(true);
    try {
      const resp = await analyzeResume(file, jobDescription);
      // resp.data is the response body: { id, filename, analysis }
      const body = resp.data;
      // Pass { filename, analysis } to ResultsDashboard
      setResult({ filename: body.filename, analysis: body.analysis });
      setPage('results');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong. Please try again.';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setPage('home');
    setError('');
  }, []);

  // Show spinner while restoring auth session
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--border-mid)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Auth page — full screen, no navbar
  if (page === 'auth') {
    return (
      <div className="app">
        <div className="bg-mesh" />
        <AuthPage onSuccess={() => setPage('home')} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="bg-mesh" />
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        onReset={handleReset}
      />
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
      {analyzing && <LoadingOverlay />}
      <main>
        {page === 'home' && (
          <UploadSection onAnalyze={handleAnalyze} isLoading={analyzing} />
        )}
        {page === 'results' && result && (
          <ResultsDashboard result={result} onReset={handleReset} />
        )}
        {page === 'builder' && (
          <ResumeBuilder onNeedAuth={() => setPage('auth')} />
        )}
        {page === 'admin' && user?.is_admin && (
          <AdminPanel onClose={() => setPage('home')} />
        )}
        {page === 'admin' && !user?.is_admin && (
          <div style={{ padding: '140px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Access denied. Admin only.</p>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <div className="container footer-inner">
          <span>© 2025 ResumeIQ</span>
          <span className="footer-sep">·</span>
          <span>Powered by Groq AI</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
