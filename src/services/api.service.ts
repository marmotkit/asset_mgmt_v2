import { AuthService } from './auth.service';
import { User, UserRole, UserStatus } from '../types/user';
import { UserPreferences } from '../types/preferences';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

class ApiServiceClass {
  private baseUrl = '/api';
  private readonly STORAGE_KEY = 'mock_users';

  private mockUsers: User[] = [
    {
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
    },
    // 可以加入更多模擬資料
  ];

  constructor() {
    // 從 localStorage 讀取資料
    const storedUsers = localStorage.getItem(this.STORAGE_KEY);
    if (storedUsers) {
      this.mockUsers = JSON.parse(storedUsers);
    } else {
      // 如果沒有儲存的資料，就儲存預設資料
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mockUsers));
    }
  }

  // 儲存資料到 localStorage
  private saveUsers(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mockUsers));
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    const token = AuthService.getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  // 使用者相關 API
  async getUsers(params: {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }): Promise<PaginatedResponse<User>> {
    const queryString = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      ...(params.filters && { filters: JSON.stringify(params.filters) })
    }).toString();

    return this.fetchWithAuth(`${this.baseUrl}/users?${queryString}`);
  }

  async getUser(id: string): Promise<User> {
    return this.fetchWithAuth(`${this.baseUrl}/users/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newUser: User = {
        id: Date.now().toString(),
        memberNo: userData.memberNo!,
        username: userData.username!,
        name: userData.name!,
        email: userData.email!,
        role: userData.role || 'normal',
        status: userData.status || 'active',
        preferences: [],
        isFirstLogin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.mockUsers.push(newUser);
      this.saveUsers(); // 儲存到 localStorage
      return newUser;
    } catch (error) {
      console.error('創建使用者失敗:', error);
      throw new Error('創建使用者失敗');
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const userIndex = this.mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('找不到使用者');
      }

      this.mockUsers[userIndex] = {
        ...this.mockUsers[userIndex],
        ...userData,
        updatedAt: new Date()
      };

      this.saveUsers(); // 儲存到 localStorage
      return this.mockUsers[userIndex];
    } catch (error) {
      console.error('更新使用者失敗:', error);
      throw new Error('更新使用者失敗');
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE'
    });
  }

  // 批次操作
  async batchUpdateUsers(ids: string[], updates: Partial<User>): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/users/batch`, {
      method: 'PUT',
      body: JSON.stringify({ ids, updates })
    });
  }

  async batchDeleteUsers(ids: string[]): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/users/batch`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('找不到使用者');
      }

      this.mockUsers[userIndex] = {
        ...this.mockUsers[userIndex],
        status,
        updatedAt: new Date()
      };

      this.saveUsers(); // 儲存到 localStorage
      return this.mockUsers[userIndex];
    } catch (error) {
      console.error('更新使用者狀態失敗:', error);
      throw new Error('更新使用者狀態失敗');
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500));

      // 更新模擬資料
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('找不到使用者');
      }

      this.mockUsers[userIndex] = {
        ...this.mockUsers[userIndex],
        role,
        updatedAt: new Date()
      };

      this.saveUsers(); // 儲存到 localStorage
      return this.mockUsers[userIndex];
    } catch (error) {
      console.error('更新使用者角色失敗:', error);
      throw new Error('更新使用者角色失敗');
    }
  }

  // 投資偏好相關 API
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.fetchWithAuth(`/users/${userId}/preferences`);
  }

  async updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    return this.fetchWithAuth(`/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // 系統設定相關 API
  async getSystemPreferences(): Promise<Record<string, any>> {
    return this.fetchWithAuth('/settings');
  }

  async updateSystemPreferences(settings: Record<string, any>): Promise<void> {
    return this.fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // 錯誤處理
  private handleError(error: any): never {
    if (error.response) {
      // 伺服器回應錯誤
      console.error('Response error:', error.response.data);
      throw new Error(error.response.data.message || '伺服器錯誤');
    } else if (error.request) {
      // 請求發送失敗
      console.error('Request error:', error.request);
      throw new Error('網路連線錯誤');
    } else {
      // 其他錯誤
      console.error('Error:', error.message);
      throw new Error('發生未知錯誤');
    }
  }

  async getUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<User>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const start = params.page * params.pageSize;
      const end = start + params.pageSize;
      const items = this.mockUsers.slice(start, end);

      return {
        items,
        total: this.mockUsers.length,
        page: params.page,
        pageSize: params.pageSize
      };
    } catch (error) {
      console.error('獲取使用者列表失敗:', error);
      throw new Error('獲取使用者列表失敗');
    }
  }
}

const ApiService = new ApiServiceClass();
export default ApiService; 