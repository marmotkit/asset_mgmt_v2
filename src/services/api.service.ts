import { AuthService } from './auth.service';
import { User, UserRole, UserStatus } from '../types/user';
import { UserPreferences } from '../types/preferences';
import { Company, IndustryType } from '../types/company';
import { Investment, RentalPayment } from '../types/investment';

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
  private readonly COMPANIES_STORAGE_KEY = 'mock_companies';
  private readonly INVESTMENTS_STORAGE_KEY = 'mock_investments';

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

  private mockCompanies: Company[] = [
    {
      id: '1',
      companyNo: 'A001',
      name: '測試公司',
      nameEn: 'Test Corp',
      industry: '科技業',
      contact: {
        name: '王小明',
        phone: '02-12345678',
        fax: '02-12345679',
        email: 'contact@test.com'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockInvestments: Investment[] = [];

  constructor() {
    // 從 localStorage 讀取資料
    const storedUsers = localStorage.getItem(this.STORAGE_KEY);
    if (storedUsers) {
      this.mockUsers = JSON.parse(storedUsers);
    } else {
      // 如果沒有儲存的資料，就儲存預設資料
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mockUsers));
    }

    const storedCompanies = localStorage.getItem(this.COMPANIES_STORAGE_KEY);
    if (storedCompanies) {
      this.mockCompanies = JSON.parse(storedCompanies);
    } else {
      localStorage.setItem(this.COMPANIES_STORAGE_KEY, JSON.stringify(this.mockCompanies));
    }

    const storedInvestments = localStorage.getItem(this.INVESTMENTS_STORAGE_KEY);
    if (storedInvestments) {
      // 將儲存的資料轉換回正確的日期格式
      this.mockInvestments = JSON.parse(storedInvestments, (key, value) => {
        // 處理日期欄位
        if (['startDate', 'endDate', 'purchaseDate', 'uploadDate', 'createdAt', 'updatedAt'].includes(key) && value) {
          return new Date(value);
        }
        // 處理合約檔案
        if (key === 'contract' && value) {
          // 如果是合約檔案，重新建立 URL
          const file = value;
          if (file.fileType.startsWith('application/')) {
            // 這裡我們需要另外儲存檔案內容
            const storedFile = localStorage.getItem(`contract_${file.id}`);
            if (storedFile) {
              const blob = new Blob([storedFile], { type: file.fileType });
              file.url = URL.createObjectURL(blob);
            }
          }
          return file;
        }
        return value;
      });
    } else {
      localStorage.setItem(this.INVESTMENTS_STORAGE_KEY, JSON.stringify(this.mockInvestments));
    }
  }

  // 儲存資料到 localStorage
  private saveUsers(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mockUsers));
  }

  private saveCompanies(): void {
    localStorage.setItem(this.COMPANIES_STORAGE_KEY, JSON.stringify(this.mockCompanies));
  }

  private saveInvestments(): void {
    // 在儲存前處理檔案
    const investmentsToStore = this.mockInvestments.map(investment => {
      if (investment.contract?.url) {
        // 儲存檔案內容
        fetch(investment.contract.url)
          .then(response => response.blob())
          .then(blob => {
            localStorage.setItem(`contract_${investment.contract!.id}`, blob.toString());
          });
      }
      return investment;
    });

    localStorage.setItem(this.INVESTMENTS_STORAGE_KEY, JSON.stringify(investmentsToStore));
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

  // 公司相關 API
  async getCompanies(): Promise<Company[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.mockCompanies;
    } catch (error) {
      console.error('獲取公司列表失敗:', error);
      throw new Error('獲取公司列表失敗');
    }
  }

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const lastCompany = this.mockCompanies[this.mockCompanies.length - 1];
      const lastNo = lastCompany ? parseInt(lastCompany.companyNo.slice(1)) : 0;
      const newNo = (lastNo + 1).toString().padStart(3, '0');

      const newCompany: Company = {
        id: Date.now().toString(),
        companyNo: `A${newNo}`,
        name: companyData.name!,
        nameEn: companyData.nameEn,
        industry: companyData.industry,
        contact: companyData.contact!,
        notes: companyData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.mockCompanies.push(newCompany);
      this.saveCompanies();
      return newCompany;
    } catch (error) {
      console.error('創建公司失敗:', error);
      throw new Error('創建公司失敗');
    }
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const companyIndex = this.mockCompanies.findIndex(c => c.id === id);
      if (companyIndex === -1) {
        throw new Error('找不到公司');
      }

      this.mockCompanies[companyIndex] = {
        ...this.mockCompanies[companyIndex],
        ...companyData,
        updatedAt: new Date()
      };

      this.saveCompanies();
      return this.mockCompanies[companyIndex];
    } catch (error) {
      console.error('更新公司失敗:', error);
      throw new Error('更新公司失敗');
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const companyIndex = this.mockCompanies.findIndex(c => c.id === id);
      if (companyIndex === -1) {
        throw new Error('找不到公司');
      }

      this.mockCompanies.splice(companyIndex, 1);
      this.saveCompanies();
    } catch (error) {
      console.error('刪除公司失敗:', error);
      throw new Error('刪除公司失敗');
    }
  }

  // 投資相關 API
  async getInvestments(): Promise<Investment[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.mockInvestments;
    } catch (error) {
      console.error('獲取投資列表失敗:', error);
      throw new Error('獲取投資列表失敗');
    }
  }

  async createInvestment(investmentData: Partial<Investment>): Promise<Investment> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newInvestment: Investment = {
        id: Date.now().toString(),
        ...investmentData,
        startDate: investmentData.startDate ? new Date(investmentData.startDate) : new Date(),
        endDate: investmentData.endDate ? new Date(investmentData.endDate) : undefined,
        purchaseDate: investmentData.type === 'movable' && investmentData.purchaseDate
          ? new Date(investmentData.purchaseDate)
          : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Investment;

      // 如果有合約檔案，確保 URL 被正確處理
      if (newInvestment.contract) {
        const contract = newInvestment.contract;
        localStorage.setItem(`contract_${contract.id}`, await fetch(contract.url).then(r => r.blob()).then(b => b.toString()));
      }

      // 生成租金收款記錄
      if (newInvestment.startDate && newInvestment.monthlyRental) {
        newInvestment.rentalPayments = this.generateRentalPayments(
          newInvestment.startDate,
          newInvestment.endDate,
          newInvestment.monthlyRental
        );
      }

      this.mockInvestments.push(newInvestment);
      this.saveInvestments();
      return newInvestment;
    } catch (error) {
      console.error('創建投資項目失敗:', error);
      throw error;
    }
  }

  private generateRentalPayments(
    startDate: Date,
    endDate: Date | undefined,
    monthlyRental: number
  ): RentalPayment[] {
    const payments: RentalPayment[] = [];
    const start = new Date(startDate);
    const end = endDate || new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

    let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
    while (currentDate <= end) {
      payments.push({
        id: `payment-${Date.now()}-${currentDate.getTime()}`,
        dueDate: new Date(currentDate),
        amount: monthlyRental,
        status: 'pending',
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return payments;
  }

  async updateInvestment(id: string, investmentData: Partial<Investment>): Promise<Investment> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = this.mockInvestments.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('找不到投資項目');
      }

      // 處理日期欄位
      const updatedInvestment = {
        ...this.mockInvestments[index],
        ...investmentData,
        startDate: investmentData.startDate ? new Date(investmentData.startDate) : this.mockInvestments[index].startDate,
        endDate: investmentData.endDate ? new Date(investmentData.endDate) : this.mockInvestments[index].endDate,
        updatedAt: new Date(),
      } as Investment;

      // 處理合約檔案
      if (updatedInvestment.contract?.url) {
        const contract = updatedInvestment.contract;
        localStorage.setItem(`contract_${contract.id}`, await fetch(contract.url).then(r => r.blob()).then(b => b.toString()));
      }

      this.mockInvestments[index] = updatedInvestment;
      this.saveInvestments();
      return updatedInvestment;
    } catch (error) {
      console.error('更新投資項目失敗:', error);
      throw new Error('更新投資項目失敗');
    }
  }

  async deleteInvestment(id: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = this.mockInvestments.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('找不到投資項目');
      }

      // 刪除相關的合約檔案
      const investment = this.mockInvestments[index];
      if (investment.contract) {
        localStorage.removeItem(`contract_${investment.contract.id}`);
      }

      this.mockInvestments.splice(index, 1);
      this.saveInvestments();
    } catch (error) {
      console.error('刪除投資項目失敗:', error);
      throw new Error('刪除投資項目失敗');
    }
  }
}

const ApiService = new ApiServiceClass();
export default ApiService; 