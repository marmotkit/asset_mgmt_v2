import { User, UserRole, UserStatus } from '../types/user';

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

class AuthServiceClass {
  private static instance: AuthServiceClass;
  private readonly API_URL = 'http://localhost:3001/api'; // TODO: 改為實際的 API URL

  private mockAdmin: User = {
    id: '1',
    memberNo: 'A001',
    username: 'admin',
    password: 'admin123',
    name: '系統管理員',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    status: 'active' as UserStatus,
    preferences: [],
    isFirstLogin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  private currentUser: User | null = null;

  private constructor() {
    // 從 localStorage 恢復使用者狀態
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  public static getInstance(): AuthServiceClass {
    if (!AuthServiceClass.instance) {
      AuthServiceClass.instance = new AuthServiceClass();
    }
    return AuthServiceClass.instance;
  }

  // 登入
  async login(username: string, password: string): Promise<User> {
    try {
      // 模擬登入驗證
      if (username === this.mockAdmin.username && password === this.mockAdmin.password) {
        const { password: _, ...userWithoutPassword } = this.mockAdmin;
        this.currentUser = userWithoutPassword;

        // 儲存到 localStorage
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', 'mock-jwt-token');

        return userWithoutPassword;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 註冊
  async register(userData: Partial<User>): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // 登出
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.getToken();
  }

  // 檢查是否為管理員
  isAdmin(): boolean {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin';
  }

  // 取得當前使用者
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 取得 JWT Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 設定登入 session
  private setSession(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userRole', response.user.role);
  }

  // 更新使用者資料
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    try {
      const token = this.getToken();
      const response = await fetch(`${this.API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // 變更密碼
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const token = this.getToken();
      const response = await fetch(`${this.API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      return response.ok;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  }
}

export const AuthService = AuthServiceClass.getInstance(); 