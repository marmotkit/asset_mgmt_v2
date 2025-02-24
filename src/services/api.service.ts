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
    return this.fetchWithAuth(`${this.baseUrl}/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.fetchWithAuth(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
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
    return this.fetchWithAuth(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
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

  async getUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      ...(params.search && { search: params.search }),
      ...(params.filters && { filters: JSON.stringify(params.filters) }),
    });

    return this.fetchWithAuth(`/users?${queryParams.toString()}`);
  }
}

const ApiService = new ApiServiceClass();
export default ApiService; 