import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { UserSession } from './context/AuthContext';
import { isFirebaseConfigured } from './firebase';
import mailgenLogo from './assets/mailgen-logo.png';

export default function Signup() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmail } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simulated Google accounts chooser states
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

      setSuccess(`Account successfully created for ${data.name}! Logging you in...`);
      
      // Auto login after signup
      const loginResponse = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        loginWithEmail(email, loginData.access_token, {
          name: data.name,
          uid: data.id || 'email-user-' + Math.floor(Math.random() * 1000),
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (mockUser?: UserSession) => {
    // If Firebase is configured, or if mockUser is explicitly selected
    if (isFirebaseConfigured || mockUser) {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await loginWithGoogle(mockUser);
        setSuccess('Google sign-in succeeded! Redirecting...');
        setShowGoogleModal(false);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during Google sign-in');
      } finally {
        setLoading(false);
      }
    } else {
      // Firebase is not configured, show the Account Chooser modal to select or add accounts!
      setError(null);
      setSuccess(null);
      setIsAddingAccount(false);
      setNewAccountName('');
      setNewAccountEmail('');
      setShowGoogleModal(true);
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

    // Explicitly sign in with the new mock account
    handleGoogleSignIn({
      uid: 'google-mock-id-' + Math.floor(Math.random() * 1000),
      name: newAcc.name,
      email: newAcc.email,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newAcc.name)}`,
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0914] flex justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-bg-glow pointer-events-none z-0"></div>

      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-950/40 border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] rounded-3xl w-full max-w-md p-8 sm:p-10 relative z-10 backdrop-blur-xl animate-fade-in">
        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <Link to="/" className="text-white/50 hover:text-white inline-flex items-center gap-1.5 self-start text-sm font-medium hover:bg-white/5 py-1 px-3 rounded-lg transition-all">
            ← Back
          </Link>
          
          <div className="text-center flex flex-col items-center">
            <img src={mailgenLogo} alt="MailGen" className="h-10 w-auto mb-4" />
            <h1 className="font-['Outfit'] text-3xl font-extrabold tracking-tight">Create Account</h1>
            <p className="text-white/60 text-sm mt-1.5">Get started with your free account</p>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm font-medium leading-relaxed animate-fade-down">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/15 border border-green-500/30 text-green-400 p-3.5 rounded-xl text-sm font-medium leading-relaxed animate-fade-down">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[11px] font-semibold text-white/55 uppercase tracking-wider text-left">Full Name</label>
            <input
              id="name"
              type="text"
              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/20 w-full"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-white/55 uppercase tracking-wider text-left">Email Address</label>
            <input
              id="email"
              type="email"
              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/20 w-full"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[11px] font-semibold text-white/55 uppercase tracking-wider text-left">Password</label>
            <input
              id="password"
              type="password"
              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/20 w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-[0_4px_15px_rgba(123,44,191,0.3)] hover:shadow-[0_6px_20px_rgba(123,44,191,0.5)] active:translate-y-0 hover:-translate-y-0.5 transition-all flex justify-center items-center cursor-pointer" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Register'
            )}
          </button>

          <div className="flex items-center text-center text-white/30 text-xs my-1">
            <span className="flex-grow border-b border-white/10"></span>
            <span className="px-3 uppercase tracking-widest font-semibold text-[10px]">or</span>
            <span className="flex-grow border-b border-white/10"></span>
          </div>

          <button
            type="button"
            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl py-3.5 px-6 text-sm font-semibold flex justify-center items-center gap-3 transition-all hover:-translate-y-0.5 cursor-pointer"
            onClick={() => handleGoogleSignIn()}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.19-4.53z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/50 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>

      {/* ── SIMULATED GOOGLE ACCOUNTS CHOOSER MODAL ── */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in" onClick={() => setShowGoogleModal(false)}>
          <div className="relative bg-white text-[#1f1f1f] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-sans flex flex-col animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-4 right-4 bg-transparent border-none text-lg text-[#5f6368] cursor-pointer z-10 p-2 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors" onClick={() => setShowGoogleModal(false)} title="Back to App">
              ✕
            </button>

            <div className="flex flex-col flex-grow p-8">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-[#1f1f1f]">
                <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.19-4.53z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </div>

              {/* Layout Content */}
              <div className="flex flex-col sm:flex-row gap-8 flex-grow">
                {/* Left side info */}
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left justify-start">
                  <div className="w-12 h-12 mb-4">
                    <svg className="w-full h-full" viewBox="52 42 88 66">
                      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
                      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
                      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
                      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-normal text-[#1f1f1f] mb-2 leading-snug">
                    {!isAddingAccount ? 'Choose an account' : 'Sign in'}
                  </h1>
                  <p className="text-sm text-[#444746]">
                    to continue to <span className="text-[#0b57d0] font-semibold">Mail Studio</span>
                  </p>
                </div>

                {/* Right side interactive accounts list */}
                <div className="flex-[1.2] flex flex-col justify-between">
                  {!isAddingAccount ? (
                    <div className="flex flex-col gap-4">
                      {/* Account List Group */}
                      <div className="flex flex-col border border-[#c4c7c5] rounded-lg overflow-hidden">
                        {googleAccounts.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            className="flex items-center gap-3 p-4 bg-white hover:bg-[#f0f4f9] border-none border-b border-[#c4c7c5] last:border-b-0 cursor-pointer text-left w-full transition-colors"
                            onClick={() => handleGoogleSignIn({
                              uid: account.email === 'aayusharadhi7@gmail.com' ? '5620dd02-6ee7-4af7-ac83-4180814e586f' : 'google-mock-id-' + Math.floor(Math.random() * 1000),
                              name: account.name,
                              email: account.email,
                              photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`
                            })}
                          >
                            <div className="w-8 h-8 rounded-full bg-[#0b57d0] text-white flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                              {account.avatar}
                            </div>
                            <div className="flex flex-col overflow-hidden text-left">
                              <span className="text-sm font-semibold text-[#1f1f1f] truncate">{account.name}</span>
                              <span className="text-xs text-[#444746] truncate">{account.email}</span>
                            </div>
                          </button>
                        ))}

                        <button
                          type="button"
                          className="flex items-center gap-3 p-4 bg-white hover:bg-[#f0f4f9] border-none cursor-pointer text-left w-full transition-colors border-t border-[#c4c7c5]"
                          onClick={() => setIsAddingAccount(true)}
                        >
                          <div className="w-8 h-8 rounded-full bg-transparent text-[#444746] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-[#1f1f1f]">Use another account</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#444746] leading-relaxed text-left">
                        Before using this app, you can review Mail Studio's{' '}
                        <a href="#" className="text-[#0b57d0] hover:underline" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and{' '}
                        <a href="#" className="text-[#0b57d0] hover:underline" onClick={(e) => e.preventDefault()}>Terms of Service</a>.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <form onSubmit={handleAddGoogleAccount} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5 text-left">
                          <label htmlFor="google-name" className="text-[10px] font-semibold text-[#444746] uppercase">Full Name</label>
                          <input
                            id="google-name"
                            type="text"
                            className="bg-transparent border border-[#747775] focus:border-[#0b57d0] focus:border-2 text-[#1f1f1f] rounded px-3 py-2 text-sm outline-none transition-all placeholder-[#747775] w-full"
                            placeholder="John Doe"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                          <label htmlFor="google-email" className="text-[10px] font-semibold text-[#444746] uppercase">Email Address</label>
                          <input
                            id="google-email"
                            type="email"
                            className="bg-transparent border border-[#747775] focus:border-[#0b57d0] focus:border-2 text-[#1f1f1f] rounded px-3 py-2 text-sm outline-none transition-all placeholder-[#747775] w-full"
                            placeholder="john@example.com"
                            value={newAccountEmail}
                            onChange={(e) => setNewAccountEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <button
                            type="button"
                            className="bg-transparent hover:bg-[#0b57d0]/8 text-[#0b57d0] text-xs font-semibold py-2 px-4 rounded transition-colors cursor-pointer border-none"
                            onClick={() => setIsAddingAccount(false)}
                          >
                            Back
                          </button>
                          <button type="submit" className="bg-[#0b57d0] hover:bg-[#0045b5] text-white text-xs font-semibold py-2 px-6 rounded-full shadow transition-colors cursor-pointer border-none">
                            Add & Sign In
                          </button>
                        </div>
                      </form>

                      <p className="text-[11px] text-[#444746] leading-relaxed text-left">
                        Make sure to enter a valid name and email address to mock sign-in correctly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f0f4f9] px-8 py-3 flex justify-between items-center text-[11px] text-[#444746] border-t border-[#c4c7c5]/50">
              <div className="flex items-center gap-1 cursor-pointer">
                <span>English (United States)</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-[#1f1f1f]" onClick={(e) => e.preventDefault()}>Help</a>
                <a href="#" className="hover:text-[#1f1f1f]" onClick={(e) => e.preventDefault()}>Privacy</a>
                <a href="#" className="hover:text-[#1f1f1f]" onClick={(e) => e.preventDefault()}>Terms</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
