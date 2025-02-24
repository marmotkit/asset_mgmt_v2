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

interface UserQueryParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ApiServiceClass {
  private baseUrl = '/api';
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
    {
      id: '2',
      memberNo: 'C001',
      username: 'user1',
      name: '測試用戶1',
      email: 'user1@example.com',
      role: 'normal' as UserRole,
      status: 'active' as UserStatus,
      preferences: [],
      isFirstLogin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      memberNo: 'B001',
      username: 'business1',
      name: '商務用戶1',
      email: 'business1@example.com',
      role: 'business' as UserRole,
      status: 'active' as UserStatus,
      preferences: [],
      isFirstLogin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

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
    const newUser: User = {
      id: String(this.mockUsers.length + 1),
      memberNo: `C${String(this.mockUsers.length + 1).padStart(3, '0')}`,
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
    return newUser;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const index = this.mockUsers.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');

    this.mockUsers[index] = {
      ...this.mockUsers[index],
      ...userData,
      updatedAt: new Date()
    };

    return this.mockUsers[index];
  }

  async deleteUser(id: string): Promise<void> {
    const index = this.mockUsers.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');
    this.mockUsers.splice(index, 1);
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

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const index = this.mockUsers.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');

    this.mockUsers[index] = {
      ...this.mockUsers[index],
      status,
      updatedAt: new Date()
    };

    return this.mockUsers[index];
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.fetchWithAuth(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
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

  async getUsersPaginated(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    console.log('ApiService.getUsersPaginated called with params:', params);
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 500));

    const start = params.page * params.pageSize;
    const end = start + params.pageSize;
    
    const response = {
      items: this.mockUsers.slice(start, end),
      total: this.mockUsers.length,
      page: params.page,
      pageSize: params.pageSize
    };
    
    console.log('ApiService.getUsersPaginated response:', response);
    return response;
  }
}

export const ApiService = new ApiServiceClass(); 