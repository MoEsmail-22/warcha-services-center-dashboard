import { createContext, useContext, useEffect, useState } from 'react';
import { createWorkshop } from '../API/Auth/Creat';
import { loginUser } from '../API/Auth/Login';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to restore auth session', e);
    } finally {
      setLoading(false);
    }
  }, []);

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

    const accessToken =
      response?.data?.accessToken ||
      response?.data?.token ||
      response?.accessToken ||
      response?.token;
    if (accessToken) {
      localStorage.setItem('auth_token', accessToken);
    }

    if (response?.data?.expiresAt) {
      localStorage.setItem('auth_token_expires_at', response.data.expiresAt);
    }

    const loggedInUser = saveUserSession({
      ...response,
      email,
    });

    return {
      ...response,
      user: loggedInUser,
    };
  };

  const register = async (workshopData) => {
    const result = await createWorkshop(workshopData);
    const registeredUser = saveUserSession({
      ...result,
      ...workshopData,
    });

    const token = result?.token || result?.data?.token;
    if (token) localStorage.setItem('auth_token', token);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expires_at');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
