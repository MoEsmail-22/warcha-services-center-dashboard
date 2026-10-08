import { createContext, useContext, useEffect, useState } from 'react';
import { createWorkshop } from '../API/Auth/Creat';
import { loginUser } from '../API/Auth/Login';
const AuthContext = createContext(null);

function saveAuthTokens(tokenResponse) {
  const tokenData = tokenResponse?.data || tokenResponse || {};
  const accessToken =
    tokenData.accessToken || tokenData.token || tokenResponse?.accessToken || tokenResponse?.token;
  const refreshToken = tokenData.refreshToken || tokenResponse?.refreshToken;

  if (accessToken) localStorage.setItem('auth_token', accessToken);
  if (tokenData.expiresAt) localStorage.setItem('auth_token_expires_at', tokenData.expiresAt);

  // Clear stale refresh credentials if this login response did not issue a new one.
  if (refreshToken) localStorage.setItem('auth_refresh_token', refreshToken);
  else localStorage.removeItem('auth_refresh_token');

  if (tokenData.refreshTokenExpiresAt) {
    localStorage.setItem('auth_refresh_token_expires_at', tokenData.refreshTokenExpiresAt);
  } else {
    localStorage.removeItem('auth_refresh_token_expires_at');
  }

  return accessToken;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first mount
  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to restore auth session', e);
    } finally {
      setLoading(false);
    }

    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const isDemoMode = () => localStorage.getItem('demo_mode') === 'true';

  const saveUserSession = (userData) => {
    const source = {
      ...userData,
      ...userData?.data,
      ...userData?.user,
      ...userData?.data?.user,
    };
    const id = source.id || source.userId || source.workshopId || source.workshop?.id;
    const safeUser = {
      id,
      userId: source.userId || id,
      name: source.name || source.workshop?.name,
      email: source.email,
      phone: source.phone,
      address: source.address,
    };

    localStorage.setItem('auth_user', JSON.stringify(safeUser));
    setUser(safeUser);

    return safeUser;
  };

  const login = async ({ email, password }) => {
    const devToken = import.meta.env.VITE_DEV_ACCESS_TOKEN;
    if (import.meta.env.VITE_ENABLE_DEV_AUTH === 'true' && devToken) {
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_refresh_token_expires_at');
      localStorage.setItem('auth_token', devToken);

      const loggedInUser = saveUserSession({
        userId: 1,
        email,
      });

      return {
        isSuccess: true,
        message: 'Development login successful',
        data: {
          userId: loggedInUser.userId,
          email,
          accessToken: devToken,
        },
        user: loggedInUser,
      };
    }

    const response = await loginUser({
      email,
      password,
    });

    // .NET convention: { isSuccess, message, data: { accessToken | token, expiresAt, ... } }
    const accessToken = saveAuthTokens(response);

    if (!accessToken) {
      // Backend returned 200 + isSuccess=true but no token — should not normally happen.
      // Refuse to fake a session; surface a clear error instead.
      throw new Error(
        response?.message || 'Login succeeded but no access token was returned by the server.'
      );
    }

    // A real sign-in must leave the local-only demo API mode behind.
    localStorage.removeItem('demo_mode');

    const loggedInUser = saveUserSession({
      ...response,
      email,
    });

    return {
      ...response,
      user: loggedInUser,
    };
  };

  // Register a new workshop. The .NET backend returns a userId but NO JWT —
  // the account must be verified by an admin (POST /api/v1/Admin/verify-workshop/{id})
  // before login will work. So we must NOT fake a session here; otherwise the user
  // lands on the dashboard with no token and every protected request returns 401.
  const register = async (workshopData) => {
    const result = await createWorkshop(workshopData);

    const token = result?.token || result?.data?.token || result?.data?.accessToken;
    if (token) {
      // Only save a session if the backend actually returned a JWT.
      saveAuthTokens(result);
      saveUserSession({ ...result, ...workshopData });
      return { ...result, verified: true };
    }

    // No token = account is pending admin verification. Tell the caller without faking a session.
    return {
      ...result,
      verified: false,
      pendingVerification: true,
      userId: result?.data?.userId ?? result?.userId,
      message:
        result?.message ||
        'Registration successful. Your account must be verified by an admin before you can log in.',
    };
  };

  // Demo Mode: bypass real auth so the dashboard is usable while the backend team
  // verifies the workshop account. Sets a flag that client.js + contexts read to
  // skip API calls and serve mock data instead. No JWT is involved.
  const loginAsDemo = () => {
    localStorage.setItem('demo_mode', 'true');
    localStorage.removeItem('auth_token'); // never send a fake token to the real backend
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_refresh_token_expires_at');
    const demoUser = {
      id: 'demo',
      userId: 'demo',
      name: 'Demo Workshop',
      email: 'demo@example.com',
      phone: '01000000000',
      address: 'Demo Address',
    };
    localStorage.setItem('auth_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return demoUser;
  };

  /** Merge changes (e.g. a renamed workshop) into the saved session user. */
  const updateUser = (updates) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expires_at');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('demo_mode');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, loginAsDemo, isDemoMode, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
