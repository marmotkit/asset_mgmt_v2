import { Investment, MovableInvestment, ImmovableInvestment, InvestmentStatus } from '../types/investment';
import { User, UserRole, UserStatus, UserPreference } from '../types/user';
import { Company, IndustryType } from '../types/company';
import { USER_ROLE_PREFIX } from '../utils/memberNoGenerator';

// 模擬 API 服務
export class ApiService {
    private static instance: ApiService;
    private static investments: Investment[] = [
        {
            id: '1',
            companyId: '1',
            type: 'movable',
            name: '設備投資A',
            description: '生產線設備',
            amount: 1000000,
            startDate: '2023-01-01',
            status: 'active',
            assetType: '機械設備',
            serialNumber: 'EQ-001',
            manufacturer: '台灣機械',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
        } as MovableInvestment,
        {
            id: '2',
            companyId: '1',
            type: 'immovable',
            name: '廠房B',
            description: '工業區廠房',
            amount: 50000000,
            startDate: '2023-02-01',
            status: 'active',
            location: '新北市工業區',
            area: 500,
            propertyType: '工業用地',
            registrationNumber: 'LD-002',
            createdAt: '2023-02-01T00:00:00Z',
            updatedAt: '2023-02-01T00:00:00Z'
        } as ImmovableInvestment
    ];
    private static mockUsers: User[] = [];
    private static mockCompanies: Company[] = [];

    private constructor() { }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    private static loadUsersFromStorage() {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            ApiService.mockUsers = JSON.parse(storedUsers);
        } else {
            // 初始化預設管理員
            ApiService.mockUsers = [{
                id: '1',
                memberNo: 'M001',
                username: 'admin',
                name: '管理員',
                email: 'admin@example.com',
                role: 'admin',
                status: 'active',
                preferences: [],
                isFirstLogin: false,
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z'
            }];
            localStorage.setItem('users', JSON.stringify(ApiService.mockUsers));
        }
    }

    private static saveUsersToStorage() {
        localStorage.setItem('users', JSON.stringify(ApiService.mockUsers));
    }

    // User related methods
    static async getUsers(): Promise<User[]> {
        if (ApiService.mockUsers.length === 0) {
            ApiService.loadUsersFromStorage();
        }
        return Promise.resolve([...ApiService.mockUsers]);
    }

    static async createUser(user: User): Promise<User> {
        console.log('Creating user:', user);
        const newUser = {
            ...user,
            id: user.id || crypto.randomUUID(),
            memberNo: user.memberNo || await this.generateMemberNo(user.role),
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            preferences: user.preferences || [],
            isFirstLogin: user.isFirstLogin ?? true,
            status: user.status || 'active'
        };
        console.log('New user to be created:', newUser);
        ApiService.mockUsers.push(newUser);
        ApiService.saveUsersToStorage();
        return Promise.resolve(newUser);
    }

    static async updateUser(user: User): Promise<User> {
        console.log('Updating user:', user);
        console.log('Current users:', ApiService.mockUsers);

        if (!user.id) {
            throw new Error('會員 ID 不能為空');
        }

        const index = ApiService.mockUsers.findIndex(u => u.id === user.id);
        console.log('Found user index:', index);

        if (index === -1) {
            throw new Error(`會員不存在 (ID: ${user.id})`);
        }

        const updatedUser = {
            ...ApiService.mockUsers[index],
            ...user,
            updatedAt: new Date().toISOString()
        };

        console.log('Updated user:', updatedUser);
        ApiService.mockUsers[index] = updatedUser;
        ApiService.saveUsersToStorage();
        return Promise.resolve(updatedUser);
    }

    static async deleteUser(userId: string): Promise<void> {
        const index = ApiService.mockUsers.findIndex(u => u.id === userId);
        if (index === -1) {
            throw new Error('會員不存在');
        }
        ApiService.mockUsers.splice(index, 1);
        ApiService.saveUsersToStorage();
        return Promise.resolve();
    }

    // 生成會員編號
    private static async generateMemberNo(role: UserRole): Promise<string> {
        const users = await this.getUsers();
        const roleUsers = users.filter(u => u.role === role);
        const count = roleUsers.length;
        const prefix = USER_ROLE_PREFIX[role];
        const paddedCount = String(count + 1).padStart(3, '0');
        return `${prefix}${paddedCount}`;
    }

    // 生成公司編號
    private static async generateCompanyNo(): Promise<string> {
        const companies = await this.getCompanies();
        const count = companies.length;
        const paddedCount = String(count + 1).padStart(3, '0');
        return `A${paddedCount}`;
    }

    // 公開方法：取得新的公司編號
    static async getNewCompanyNo(): Promise<string> {
        return this.generateCompanyNo();
    }

    // 通用資料存取方法
    private async getData<T>(key: string): Promise<T | null> {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    private async setData<T>(key: string, data: T): Promise<void> {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Investment related methods
    static async getInvestments(): Promise<Investment[]> {
        return Promise.resolve([...ApiService.investments]);
    }

    static async getInvestment(id: string): Promise<Investment | null> {
        return Promise.resolve(ApiService.investments.find(i => i.id === id) || null);
    }

    static async createInvestment(investment: Partial<Investment>): Promise<Investment> {
        const newInvestment: Investment = {
            ...investment,
            id: investment.id || crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as Investment;

        ApiService.investments.push(newInvestment);
        return Promise.resolve(newInvestment);
    }

    static async updateInvestment(investment: Investment): Promise<Investment> {
        const index = ApiService.investments.findIndex(i => i.id === investment.id);
        if (index === -1) {
            throw new Error('Investment not found');
        }

        const updatedInvestment: Investment = {
            ...investment,
            updatedAt: new Date().toISOString()
        };

        ApiService.investments[index] = updatedInvestment;
        return Promise.resolve(updatedInvestment);
    }

    static async deleteInvestment(id: string): Promise<void> {
        const index = ApiService.investments.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error('Investment not found');
        }
        ApiService.investments.splice(index, 1);
        return Promise.resolve();
    }

    // Company related methods
    private static loadCompaniesFromStorage() {
        const storedCompanies = localStorage.getItem('companies');
        if (storedCompanies) {
            ApiService.mockCompanies = JSON.parse(storedCompanies);
        }
    }

    private static saveCompaniesToStorage() {
        localStorage.setItem('companies', JSON.stringify(ApiService.mockCompanies));
    }

    static async getCompanies(): Promise<Company[]> {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        return Promise.resolve([...ApiService.mockCompanies]);
    }

    static async getCompany(id: string): Promise<Company | null> {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const company = ApiService.mockCompanies.find(c => c.id === id);
        return Promise.resolve(company || null);
    }

    static async createCompany(data: Partial<Company>): Promise<Company> {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const company: Company = {
            id: crypto.randomUUID(),
            companyNo: await this.generateCompanyNo(),
            taxId: data.taxId || '',
            name: data.name || '',
            nameEn: data.nameEn,
            industry: data.industry || 'other',
            address: data.address || '',
            contact: data.contact || { name: '', phone: '', email: '' },
            fax: data.fax || '',
            note: data.note || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        ApiService.mockCompanies.push(company);
        ApiService.saveCompaniesToStorage();
        return Promise.resolve(company);
    }

    static async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const index = ApiService.mockCompanies.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('公司不存在');
        }
        const updatedCompany = {
            ...ApiService.mockCompanies[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        ApiService.mockCompanies[index] = updatedCompany;
        ApiService.saveCompaniesToStorage();
        return Promise.resolve(updatedCompany);
    }

    static async deleteCompany(id: string): Promise<void> {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const index = ApiService.mockCompanies.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('公司不存在');
        }
        ApiService.mockCompanies.splice(index, 1);
        ApiService.saveCompaniesToStorage();
        return Promise.resolve();
    }

    static async createMovableInvestment(data: Partial<MovableInvestment>): Promise<MovableInvestment> {
        const investment: MovableInvestment = {
            id: data.id || crypto.randomUUID(),
            companyId: data.companyId || '',
            type: 'movable',
            name: data.name || '',
            description: data.description || '',
            amount: data.amount || 0,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate,
            status: data.status || 'active',
            assetType: data.assetType || '',
            serialNumber: data.serialNumber || '',
            manufacturer: data.manufacturer || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return investment;
    }

    static async createImmovableInvestment(data: Partial<ImmovableInvestment>): Promise<ImmovableInvestment> {
        const investment: ImmovableInvestment = {
            id: data.id || crypto.randomUUID(),
            companyId: data.companyId || '',
            type: 'immovable',
            name: data.name || '',
            description: data.description || '',
            amount: data.amount || 0,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate,
            status: data.status || 'active',
            location: data.location || '',
            area: data.area || 0,
            propertyType: data.propertyType || '',
            registrationNumber: data.registrationNumber || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return investment;
    }

    // User preferences related methods
    static async getUserPreferences(userId: string): Promise<UserPreference[]> {
        const user = ApiService.mockUsers.find(u => u.id === userId);
        return Promise.resolve(user?.preferences || []);
    }

    static async updateUserPreferences(userId: string, preferences: UserPreference[]): Promise<UserPreference[]> {
        const userIndex = ApiService.mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        ApiService.mockUsers[userIndex].preferences = preferences;
        return Promise.resolve(preferences);
    }
}

export const ApiServiceInstance = ApiService.getInstance();