import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured, signInWithPopup, signOut } from '../firebase';

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: (mockUser?: UserSession) => Promise<void>;
  loginWithEmail: (email: string, token: string, userDetails: { name: string; uid: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mailgen_user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('mailgen_user');
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (mockUser?: UserSession) => {
    setError(null);
    setLoading(true);
    try {
      let loggedInUser: UserSession;

      if (isFirebaseConfigured && auth) {
        // Real Firebase Sign In
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        loggedInUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(fbUser.displayName || 'GU'),
        };
      } else {
        // Simulated Mock Sign In using selected mock account
        if (!mockUser) {
          throw new Error('No mock user account selected');
        }
        loggedInUser = mockUser;
      }

      // Synchronize with NestJS backend to retrieve JWT
      const response = await fetch('http://localhost:3000/auth/google-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: loggedInUser.name,
          email: loggedInUser.email,
          sub: loggedInUser.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with NestJS backend');
      }

      const data = await response.json();
      const backendToken = data.access_token;

      // Save states
      setUser(loggedInUser);
      setToken(backendToken);

      // Persist in localStorage
      localStorage.setItem('mailgen_user', JSON.stringify(loggedInUser));
      localStorage.setItem('access_token', backendToken);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during Google login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = (email: string, jwtToken: string, userDetails: { name: string; uid: string }) => {
    const sessionUser: UserSession = {
      uid: userDetails.uid,
      name: userDetails.name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userDetails.name)}`,
    };

    setUser(sessionUser);
    setToken(jwtToken);
    localStorage.setItem('mailgen_user', JSON.stringify(sessionUser));
    localStorage.setItem('access_token', jwtToken);
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Firebase signOut error:', err);
    } finally {
      // Clear all session states
      setUser(null);
      setToken(null);
      localStorage.removeItem('mailgen_user');
      localStorage.removeItem('access_token');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
