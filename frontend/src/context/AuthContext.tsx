import { createContext, useContext, useState, ReactNode } from 'react';

interface Admin {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  admin: Admin | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);

  const login = (newToken: string, newAdmin: Admin) => {
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
