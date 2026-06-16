import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, googleLoginUrl } from './lib/api';
import { saveAccessToken } from './lib/auth';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<'signup' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoadingAction('signup');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    try {
      await authApi.signup(trimmedName, trimmedEmail, password);
      const loginResponse = await authApi.login(trimmedEmail, password);
      saveAccessToken(loginResponse.access_token);
      setSuccess('Account created. Taking you to your dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleSignup = () => {
    setLoadingAction('google');
    window.location.href = googleLoginUrl;
  };

  const isLoading = loadingAction !== null;

  return (
    <main className="auth-page-wrapper">
      <section className="auth-card" aria-labelledby="signup-title">
        <Link to="/" className="auth-back-link">
          Back to home
        </Link>

        <div className="auth-header">
          <span className="auth-eyebrow">MailGen</span>
          <h1 id="signup-title">Create your account</h1>
          <p>Start writing better emails with a clean workspace and saved history.</p>
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

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="input-glass"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

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
              placeholder="Use at least 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {loadingAction === 'signup' ? <span className="spinner" aria-hidden="true" /> : null}
            {loadingAction === 'signup' ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {loadingAction === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        <p className="auth-switch-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
