import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from './lib/api';
import { saveAccessToken } from './lib/auth';

const GOOGLE_DEMO_PROFILE = {
  name: 'MailGen Demo User',
  email: 'demo.google@mailgen.local',
  sub: 'mailgen-google-demo-user',
};

type LocationState = {
  email?: string;
  message?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const [email, setEmail] = useState(locationState.email || '');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<'password' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(locationState.message || null);

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoadingAction('password');

    try {
      const response = await authApi.login(email.trim(), password);
      saveAccessToken(response.access_token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);
    setLoadingAction('google');

    try {
      const response = await authApi.googleDemo(GOOGLE_DEMO_PROFILE);
      saveAccessToken(response.access_token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;

  return (
    <main className="auth-page-wrapper">
      <section className="auth-card" aria-labelledby="login-title">
        <Link to="/" className="auth-back-link">
          Back to home
        </Link>

        <div className="auth-header">
          <span className="auth-eyebrow">MailGen</span>
          <h1 id="login-title">Welcome back</h1>
          <p>Log in to generate, edit, and save professional emails.</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input-glass"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-glass"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {loadingAction === 'password' ? <span className="spinner" aria-hidden="true" /> : null}
            {loadingAction === 'password' ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {loadingAction === 'google' ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="auth-switch-text">
          New to MailGen? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
