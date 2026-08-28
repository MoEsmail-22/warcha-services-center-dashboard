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
    const safeUser = {
      id: userData.id || userData.userId,
      userId: userData.userId || userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
    };

    localStorage.setItem('auth_user', JSON.stringify(safeUser));
    setUser(safeUser);

    return safeUser;
  };

  const login = async ({ email, password }) => {
    const response = await loginUser({
      email,
      password,
    });

    console.log(response);

    const loggedInUser = saveUserSession({
      ...response.data,
      userId: response.data?.userId,
      email,
    });

    return {
      ...response,
      user: loggedInUser,
    };
  };

  const register = async (workshopData) => {
    const result = await createWorkshop(workshopData);
    const registeredUser = result?.user ||
      result?.data || {
        name: workshopData.name,
        email: workshopData.email,
      };

    if (result?.token) localStorage.setItem('auth_token', result.token);
    localStorage.setItem('auth_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
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
