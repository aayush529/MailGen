import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Sign-in states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleAccounts, setGoogleAccounts] = useState([
    { name: 'Aayush Aradhi', email: 'aayusharadhi7@gmail.com', avatar: 'AA' },
    { name: 'Alice Smith', email: 'alice@example.com', avatar: 'AS' },
    { name: 'Guest User', email: 'guest@example.com', avatar: 'GU' },
  ]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Registration failed';
        throw new Error(message);
      }

      setSuccess(`Account successfully created for ${data.name}! Redirecting to login...`);
      setName('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(null);
    setSuccess(null);
    setIsAddingAccount(false);
    setNewAccountName('');
    setNewAccountEmail('');
    setShowGoogleModal(true);
  };

  const selectGoogleAccount = async (name: string, email: string) => {
    setShowGoogleModal(false);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const sub =
        email === 'aayusharadhi7@gmail.com'
          ? '5620dd02-6ee7-4af7-ac83-4180814e586f'
          : 'google-mock-id-' + Math.floor(Math.random() * 1000);

      const response = await fetch('http://localhost:3000/auth/google-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, sub }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google mock login failed');
      }

      setSuccess(`Google sign-in succeeded for ${name}!`);
      localStorage.setItem('access_token', data.access_token);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim() || !newAccountEmail.trim()) {
      return;
    }

    if (!newAccountEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const parts = newAccountName.trim().split(' ');
    const avatar =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();

    const newAcc = {
      name: newAccountName.trim(),
      email: newAccountEmail.trim(),
      avatar,
    };

    setGoogleAccounts((prev) => [...prev, newAcc]);
    setIsAddingAccount(false);
    selectGoogleAccount(newAcc.name, newAcc.email);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <form onSubmit={handleSignup} className="form-layout">
        <Link to="/" className="btn-back" style={{ textDecoration: 'none' }}>
          ← Back
        </Link>
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Get started with your free account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="input-glass"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="input-glass"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-glass"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <div className="spinner"></div> : 'Register'}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.19-4.53z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign in with Google
        </button>

        <p className="auth-switch-text" style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          Already have an account? <Link to="/login" style={{ color: '#c77dff', textDecoration: 'none', fontWeight: 500 }}>Log In</Link>
        </p>
      </form>
    </div>

      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="google-close-btn" onClick={() => setShowGoogleModal(false)} title="Back to App">
              ✕
            </button>

            <div className="google-oauth-card">
              <div className="google-oauth-header">
                <div className="google-header-logo">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.19-4.53z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </div>
              </div>

              <div className="google-oauth-content">
                {!isAddingAccount ? (
                  <>
                    <div className="google-oauth-left">
                      <div className="app-logo-box">
                        <svg className="app-logo-icon" viewBox="52 42 88 66">
                          <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
                          <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
                          <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
                          <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
                        </svg>
                      </div>
                      <h1>Choose an account</h1>
                      <p>
                        to continue to <span className="google-app-link">Mail Studio</span>
                      </p>
                    </div>

                    <div className="google-oauth-right">
                      <div className="google-account-list">
                        {googleAccounts.map((account) => (
                          <button
                            key={account.email}
                            className="google-account-item"
                            onClick={() => selectGoogleAccount(account.name, account.email)}
                          >
                            <div className="google-account-avatar">{account.avatar}</div>
                            <div className="google-account-info">
                              <span className="google-account-name">{account.name}</span>
                              <span className="google-account-email">{account.email}</span>
                            </div>
                          </button>
                        ))}

                        <button
                          type="button"
                          className="google-account-item google-use-another"
                          onClick={() => setIsAddingAccount(true)}
                        >
                          <div className="google-account-avatar google-use-another-avatar">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <div className="google-account-info">
                            <span className="google-account-name">Use another account</span>
                          </div>
                        </button>
                      </div>

                      <p className="google-disclaimer">
                        Before using this app, you can review Mail Studio's{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
                        <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="google-oauth-left">
                      <div className="app-logo-box">
                        <svg className="app-logo-icon" viewBox="52 42 88 66">
                          <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
                          <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
                          <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
                          <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
                        </svg>
                      </div>
                      <h1>Sign in</h1>
                      <p>
                        to continue to <span className="google-app-link">Mail Studio</span>
                      </p>
                    </div>

                    <div className="google-oauth-right">
                      <form onSubmit={handleAddGoogleAccount} className="google-add-form">
                        <div className="google-input-group">
                          <input
                            id="google-name"
                            type="text"
                            className="google-input"
                            placeholder=" "
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            required
                          />
                          <label htmlFor="google-name">Full Name</label>
                        </div>

                        <div className="google-input-group">
                          <input
                            id="google-email"
                            type="email"
                            className="google-input"
                            placeholder=" "
                            value={newAccountEmail}
                            onChange={(e) => setNewAccountEmail(e.target.value)}
                            required
                          />
                          <label htmlFor="google-email">Email Address</label>
                        </div>

                        <div className="google-form-actions">
                          <button
                            type="button"
                            className="google-btn-text"
                            onClick={() => setIsAddingAccount(false)}
                          >
                            Back
                          </button>
                          <button type="submit" className="google-btn-filled">
                            Add & Sign In
                          </button>
                        </div>
                      </form>

                      <p className="google-disclaimer" style={{ marginTop: '30px' }}>
                        Make sure to enter a valid name and email address to mock sign-in correctly.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="google-oauth-footer">
              <div className="google-footer-left">
                <span>English (United States)</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
              <div className="google-footer-right">
                <a href="#" onClick={(e) => e.preventDefault()}>Help</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
