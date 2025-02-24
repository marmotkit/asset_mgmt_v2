import React from 'react';
import type { ReactNode, ReactElement } from 'react';
import { User, UserRole, UserStatus } from '../types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// 建立初始值
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async () => { throw new Error('Context not initialized') },
  logout: () => { throw new Error('Context not initialized') }
};

// 建立 Context
const AuthContext = React.createContext<AuthContextType>(defaultContext);
AuthContext.displayName = 'AuthContext'; // 幫助調試

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    console.log('AuthProvider mounted');
    try {
      const storedUser = localStorage.getItem('user');
      console.log('Checking stored user:', storedUser);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User loaded from storage');
      } else {
        const defaultUser: User = {
          id: '1',
          memberNo: 'A001',
          username: 'admin',
          name: '系統管理員',
          email: 'admin@example.com',
          role: 'admin' as UserRole,
          status: 'active' as UserStatus,
          preferences: [],
          isFirstLogin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setUser(defaultUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('Default user created');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    isAuthenticated,
    user,
    login: async (username: string, password: string) => {
      const mockUser: User = {
        id: '1',
        memberNo: 'A001',
        username: 'admin',
        name: '系統管理員',
        email: 'admin@example.com',
        role: 'admin' as UserRole,
        status: 'active' as UserStatus,
        preferences: [],
        isFirstLogin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(mockUser));
    },
    logout: () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  }), [isAuthenticated, user]);

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 