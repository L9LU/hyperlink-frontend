import { createContext, useContext, useState, useEffect } from 'react';
import { readUser, writeUser, clearUser } from './authStorage.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readUser());
    setLoading(false);
  }, []);

  // remember: true = stay signed in on this device, false = until the tab closes.
  // Leave it out (e.g. when updating the profile) to keep the current choice.
  const login = (userData, remember) => {
    setUser(userData);
    writeUser(userData, remember);
  };

  const logout = () => {
    setUser(null);
    clearUser();
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
