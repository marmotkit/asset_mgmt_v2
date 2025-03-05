import { Investment, MovableInvestment, ImmovableInvestment, InvestmentStatus } from '../types/investment';
import { User, UserRole, UserStatus, UserPreference } from '../types/user';
import { Company, IndustryType } from '../types/company';
import { LeaseItem } from '../types/lease';
import { RentalPayment } from '../types/payment';
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
            leaseItems: [],
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
            leaseItems: [],
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

    // Investment related methods
    static async getInvestments(): Promise<Investment[]> {
        return Promise.resolve([...ApiService.investments]);
    }

    static async getInvestment(id: string): Promise<Investment | undefined> {
        const investment = ApiService.investments.find(inv => inv.id === id);
        return Promise.resolve(investment);
    }

    static async createInvestment(investment: Investment): Promise<Investment> {
        ApiService.investments.push(investment);
        return Promise.resolve(investment);
    }

    static async updateInvestment(investment: Investment): Promise<Investment> {
        const index = ApiService.investments.findIndex(inv => inv.id === investment.id);
        if (index === -1) {
            throw new Error('Investment not found');
        }
        ApiService.investments[index] = investment;
        return Promise.resolve(investment);
    }

    static async deleteInvestment(id: string): Promise<void> {
        const index = ApiService.investments.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('Investment not found');
        }
        ApiService.investments.splice(index, 1);
        return Promise.resolve();
    }

    // Company related methods
    static async getCompanies(): Promise<Company[]> {
        return Promise.resolve([]);
    }

    static async getCompany(id: string): Promise<Company | null> {
        return Promise.resolve(null);
    }

    static async createCompany(data: Partial<Company>): Promise<Company> {
        const company: Company = {
            id: data.id || crypto.randomUUID(),
            name: data.name || '',
            nameEn: data.nameEn,
            companyNo: data.companyNo || '',
            industry: data.industry || 'other',
            contact: data.contact || { name: '', phone: '', email: '' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return Promise.resolve(company);
    }

    static async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
        return this.createCompany({ ...data, id });
    }

    static async deleteCompany(id: string): Promise<void> {
        return Promise.resolve();
    }

    // Lease related methods
    static async getLeaseItems(investmentId: string): Promise<LeaseItem[]> {
        const investment = await this.getInvestment(investmentId);
        return Promise.resolve(investment?.leaseItems || []);
    }

    static async createLeaseItem(investmentId: string, leaseItem: LeaseItem): Promise<LeaseItem> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        investment.leaseItems.push(leaseItem);
        return Promise.resolve(leaseItem);
    }

    static async updateLeaseItem(investmentId: string, leaseItem: LeaseItem): Promise<LeaseItem> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const index = investment.leaseItems.findIndex(item => item.id === leaseItem.id);
        if (index === -1) {
            throw new Error('Lease item not found');
        }
        investment.leaseItems[index] = leaseItem;
        return Promise.resolve(leaseItem);
    }

    static async deleteLeaseItem(investmentId: string, leaseItemId: string): Promise<void> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const index = investment.leaseItems.findIndex(item => item.id === leaseItemId);
        if (index === -1) {
            throw new Error('Lease item not found');
        }
        investment.leaseItems.splice(index, 1);
        return Promise.resolve();
    }

    // Rental payment related methods
    static async getRentalPayments(investmentId: string, leaseItemId: string): Promise<RentalPayment[]> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const leaseItem = investment.leaseItems.find(item => item.id === leaseItemId);
        return Promise.resolve(leaseItem?.rentalPayments || []);
    }

    static async createRentalPayment(
        investmentId: string,
        leaseItemId: string,
        payment: RentalPayment
    ): Promise<RentalPayment> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const leaseItem = investment.leaseItems.find(item => item.id === leaseItemId);
        if (!leaseItem) {
            throw new Error('Lease item not found');
        }
        leaseItem.rentalPayments.push(payment);
        return Promise.resolve(payment);
    }

    static async updateRentalPayment(
        investmentId: string,
        leaseItemId: string,
        payment: RentalPayment
    ): Promise<RentalPayment> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const leaseItem = investment.leaseItems.find(item => item.id === leaseItemId);
        if (!leaseItem) {
            throw new Error('Lease item not found');
        }
        const index = leaseItem.rentalPayments.findIndex(p => p.id === payment.id);
        if (index === -1) {
            throw new Error('Payment not found');
        }
        leaseItem.rentalPayments[index] = payment;
        return Promise.resolve(payment);
    }

    static async deleteRentalPayment(
        investmentId: string,
        leaseItemId: string,
        paymentId: string
    ): Promise<void> {
        const investment = await this.getInvestment(investmentId);
        if (!investment) {
            throw new Error('Investment not found');
        }
        const leaseItem = investment.leaseItems.find(item => item.id === leaseItemId);
        if (!leaseItem) {
            throw new Error('Lease item not found');
        }
        const index = leaseItem.rentalPayments.findIndex(p => p.id === paymentId);
        if (index === -1) {
            throw new Error('Payment not found');
        }
        leaseItem.rentalPayments.splice(index, 1);
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
            leaseItems: [],
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
            leaseItems: [],
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