"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServiceInstance = exports.ApiService = void 0;
const memberNoGenerator_1 = require("../utils/memberNoGenerator");
const axios_1 = __importDefault(require("axios"));
const rental_1 = require("../types/rental");
// 設置一個axios實例
const apiClient = axios_1.default.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// 添加請求攔截器，用於設置JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// 模擬 API 服務
class ApiService {
    constructor() { }
    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
    static loadUsersFromStorage() {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            ApiService.mockUsers = JSON.parse(storedUsers);
        }
        else {
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
    static saveUsersToStorage() {
        localStorage.setItem('users', JSON.stringify(ApiService.mockUsers));
    }
    // User related methods
    static async getUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch('https://asset-mgmt-api-test.onrender.com/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('載入會員資料失敗');
        }
        return await response.json();
    }
    static async createUser(user) {
        const token = localStorage.getItem('token');
        const response = await fetch('https://asset-mgmt-api-test.onrender.com/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            throw new Error('新增會員失敗');
        }
        return await response.json();
    }
    static async updateUser(user) {
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
    static async deleteUser(userId) {
        const index = ApiService.mockUsers.findIndex(u => u.id === userId);
        if (index === -1) {
            throw new Error('會員不存在');
        }
        ApiService.mockUsers.splice(index, 1);
        ApiService.saveUsersToStorage();
        return Promise.resolve();
    }
    // 生成會員編號
    static async generateMemberNo(role) {
        const users = await this.getUsers();
        const roleUsers = users.filter(u => u.role === role);
        const count = roleUsers.length;
        const prefix = memberNoGenerator_1.USER_ROLE_PREFIX[role];
        const paddedCount = String(count + 1).padStart(3, '0');
        return `${prefix}${paddedCount}`;
    }
    // 生成公司編號
    static async generateCompanyNo() {
        const companies = await this.getCompanies();
        const count = companies.length;
        const paddedCount = String(count + 1).padStart(3, '0');
        return `A${paddedCount}`;
    }
    // 公開方法：取得新的公司編號
    static async getNewCompanyNo() {
        return this.generateCompanyNo();
    }
    // 通用資料存取方法
    async getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    async setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    // Investment related methods
    static async getInvestments() {
        console.log('獲取所有投資項目...');
        try {
            const response = await apiClient.get('/investments');
            console.log(`返回 ${response.data.length} 筆投資項目`);
            return response.data;
        }
        catch (error) {
            console.error('獲取投資項目失敗:', error);
            throw new Error('載入投資資料失敗');
        }
    }
    static async getInvestment(id) {
        var _a;
        console.log(`正在查找投資項目 ID: ${id}`);
        try {
            const response = await apiClient.get(`/investments/${id}`);
            console.log('查找結果: 找到項目');
            return response.data;
        }
        catch (error) {
            console.error('查找投資項目失敗:', error);
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                console.log('查找結果: 未找到項目');
                return null;
            }
            throw new Error('獲取投資項目失敗');
        }
    }
    static async createInvestment(investment) {
        console.log('創建投資項目:', investment);
        try {
            const response = await apiClient.post('/investments', investment);
            console.log('投資項目創建成功');
            return response.data;
        }
        catch (error) {
            console.error('創建投資項目失敗:', error);
            throw new Error('創建投資項目失敗');
        }
    }
    static async updateInvestment(investment) {
        console.log('更新投資項目:', investment);
        try {
            const response = await apiClient.put(`/investments/${investment.id}`, investment);
            console.log('投資項目更新成功');
            return response.data;
        }
        catch (error) {
            console.error('更新投資項目失敗:', error);
            throw new Error('更新投資項目失敗');
        }
    }
    static async deleteInvestment(id) {
        console.log('刪除投資項目 ID:', id);
        try {
            await apiClient.delete(`/investments/${id}`);
            console.log('投資項目刪除成功');
        }
        catch (error) {
            console.error('刪除投資項目失敗:', error);
            throw new Error('刪除投資項目失敗');
        }
    }
    // Company related methods
    static loadCompaniesFromStorage() {
        const storedCompanies = localStorage.getItem('companies');
        if (storedCompanies) {
            ApiService.mockCompanies = JSON.parse(storedCompanies);
        }
    }
    static saveCompaniesToStorage() {
        localStorage.setItem('companies', JSON.stringify(ApiService.mockCompanies));
    }
    static async getCompanies() {
        const token = localStorage.getItem('token');
        const response = await fetch('https://asset-mgmt-api-test.onrender.com/api/companies', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('載入公司資料失敗');
        }
        return await response.json();
    }
    static async getCompany(id) {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const company = ApiService.mockCompanies.find(c => c.id === id);
        return Promise.resolve(company || null);
    }
    static async createCompany(data) {
        if (ApiService.mockCompanies.length === 0) {
            ApiService.loadCompaniesFromStorage();
        }
        const company = {
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
    static async updateCompany(id, data) {
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
    static async deleteCompany(id) {
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
    static async createMovableInvestment(data) {
        const investment = {
            id: data.id || crypto.randomUUID(),
            companyId: data.companyId || '',
            userId: data.userId || '',
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
    static async createImmovableInvestment(data) {
        const investment = {
            id: data.id || crypto.randomUUID(),
            companyId: data.companyId || '',
            userId: data.userId || '',
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
    static async getUserPreferences(userId) {
        const user = ApiService.mockUsers.find(u => u.id === userId);
        return Promise.resolve((user === null || user === void 0 ? void 0 : user.preferences) || []);
    }
    static async updateUserPreferences(userId, preferences) {
        const userIndex = ApiService.mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        ApiService.mockUsers[userIndex].preferences = preferences;
        return Promise.resolve(preferences);
    }
    // 租賃標準設定相關方法
    static loadRentalStandardsFromStorage() {
        const storedStandards = localStorage.getItem('rentalStandards');
        if (storedStandards) {
            ApiService.mockRentalStandards = JSON.parse(storedStandards);
        }
        else {
            // 初始化預設租賃標準
            ApiService.mockRentalStandards = [
                {
                    id: '1',
                    investmentId: '1',
                    monthlyRent: 10000,
                    startDate: '2023-01-01',
                    endDate: '2026-12-31',
                    renterName: 'LKT',
                    renterTaxId: '123456789',
                    note: 'Standard rental agreement',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('rentalStandards', JSON.stringify(ApiService.mockRentalStandards));
        }
    }
    static saveRentalStandardsToStorage() {
        localStorage.setItem('rentalStandards', JSON.stringify(ApiService.mockRentalStandards));
    }
    static loadProfitSharingStandardsFromStorage() {
        const storedStandards = localStorage.getItem('profitSharingStandards');
        if (storedStandards) {
            ApiService.mockProfitSharingStandards = JSON.parse(storedStandards);
        }
        else {
            // 初始化預設分潤標準
            ApiService.mockProfitSharingStandards = [
                {
                    id: '1',
                    investmentId: '1',
                    type: rental_1.ProfitSharingType.PERCENTAGE,
                    value: 10,
                    startDate: '2023-01-01',
                    endDate: '2026-12-31',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('profitSharingStandards', JSON.stringify(ApiService.mockProfitSharingStandards));
        }
    }
    static saveProfitSharingStandardsToStorage() {
        localStorage.setItem('profitSharingStandards', JSON.stringify(ApiService.mockProfitSharingStandards));
    }
    static async getRentalStandards(investmentId) {
        if (ApiService.mockRentalStandards.length === 0) {
            ApiService.loadRentalStandardsFromStorage();
        }
        let standards = [...ApiService.mockRentalStandards];
        if (investmentId) {
            standards = standards.filter(s => s.investmentId === investmentId);
        }
        return Promise.resolve(standards);
    }
    static async createRentalStandard(data) {
        const newStandard = {
            id: crypto.randomUUID(),
            investmentId: data.investmentId || '',
            monthlyRent: data.monthlyRent || 0,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate,
            renterName: data.renterName || '',
            renterTaxId: data.renterTaxId,
            note: data.note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        ApiService.mockRentalStandards.push(newStandard);
        ApiService.saveRentalStandardsToStorage();
        return Promise.resolve(newStandard);
    }
    static async updateRentalStandard(id, data) {
        const index = ApiService.mockRentalStandards.findIndex(s => s.id === id);
        if (index === -1)
            throw new Error('租賃標準不存在');
        const updatedStandard = {
            ...ApiService.mockRentalStandards[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        ApiService.mockRentalStandards[index] = updatedStandard;
        ApiService.saveRentalStandardsToStorage();
        return Promise.resolve(updatedStandard);
    }
    static async deleteRentalStandard(id) {
        const index = ApiService.mockRentalStandards.findIndex(s => s.id === id);
        if (index === -1)
            throw new Error('租賃標準不存在');
        ApiService.mockRentalStandards.splice(index, 1);
        ApiService.saveRentalStandardsToStorage();
        return Promise.resolve();
    }
    // 分潤標準設定相關方法
    static async getProfitSharingStandards(investmentId) {
        if (ApiService.mockProfitSharingStandards.length === 0) {
            ApiService.loadProfitSharingStandardsFromStorage();
        }
        let standards = [...ApiService.mockProfitSharingStandards];
        if (investmentId) {
            standards = standards.filter(s => s.investmentId === investmentId);
        }
        return Promise.resolve(standards);
    }
    static async createProfitSharingStandard(data) {
        const newStandard = {
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        ApiService.mockProfitSharingStandards.push(newStandard);
        ApiService.saveProfitSharingStandardsToStorage();
        return Promise.resolve(newStandard);
    }
    static async updateProfitSharingStandard(id, data) {
        const index = ApiService.mockProfitSharingStandards.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('分潤標準不存在');
        }
        const updatedStandard = {
            ...ApiService.mockProfitSharingStandards[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        ApiService.mockProfitSharingStandards[index] = updatedStandard;
        ApiService.saveProfitSharingStandardsToStorage();
        return Promise.resolve(updatedStandard);
    }
    static async deleteProfitSharingStandard(id) {
        const index = ApiService.mockProfitSharingStandards.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('分潤標準不存在');
        }
        ApiService.mockProfitSharingStandards.splice(index, 1);
        ApiService.saveProfitSharingStandardsToStorage();
        return Promise.resolve();
    }
    // 租金收款項目相關方法
    static loadRentalPaymentsFromStorage() {
        const storedPayments = localStorage.getItem('rentalPayments');
        if (storedPayments) {
            ApiService.mockRentalPayments = JSON.parse(storedPayments);
        }
        else {
            // 初始化空的租金收款項目列表，不再自動創建預設資料
            ApiService.mockRentalPayments = [];
            localStorage.setItem('rentalPayments', JSON.stringify(ApiService.mockRentalPayments));
        }
    }
    static saveRentalPaymentsToStorage() {
        localStorage.setItem('rentalPayments', JSON.stringify(ApiService.mockRentalPayments));
    }
    static async getRentalPayments(investmentId, year, month) {
        if (ApiService.mockRentalPayments.length === 0) {
            ApiService.loadRentalPaymentsFromStorage();
        }
        let payments = [...ApiService.mockRentalPayments].map(payment => ({
            ...payment,
            amount: Number(payment.amount)
        }));
        if (investmentId) {
            payments = payments.filter(p => p.investmentId === investmentId);
        }
        if (year) {
            payments = payments.filter(p => p.year === year);
        }
        if (month) {
            payments = payments.filter(p => p.month === month);
        }
        return Promise.resolve(payments);
    }
    static async generateRentalPayments(investmentId, year) {
        try {
            // 載入現有的租金收款和租賃標準
            await ApiService.loadRentalPaymentsFromStorage();
            await ApiService.loadRentalStandardsFromStorage();
            // 檢查是否已存在該年度的租金收款項目
            const existingPayments = ApiService.mockRentalPayments.filter(p => p.investmentId === investmentId && p.year === year);
            if (existingPayments.length > 0) {
                throw new Error('該年度的租金收款項目已經存在，請勿重複生成');
            }
            // 找到對應的租賃標準
            const rentalStandards = ApiService.mockRentalStandards.filter(s => s.investmentId === investmentId && s.startDate && s.endDate // 確保有開始和結束日期
            );
            if (!rentalStandards || rentalStandards.length === 0) {
                throw new Error('尚未設定租賃標準');
            }
            // 找到適用於該年度的租賃標準
            const applicableStandard = rentalStandards.find(s => {
                if (!s.startDate || !s.endDate)
                    return false;
                const startDate = new Date(s.startDate);
                const endDate = new Date(s.endDate);
                const yearStart = new Date(year, 0, 1);
                const yearEnd = new Date(year, 11, 31);
                return startDate <= yearEnd && endDate >= yearStart;
            });
            if (!applicableStandard || !applicableStandard.startDate || !applicableStandard.endDate) {
                throw new Error('找不到適用於該年度的租賃標準');
            }
            if (!applicableStandard.renterName) {
                throw new Error('租賃標準中未設定承租人資訊');
            }
            const standardStartDate = new Date(applicableStandard.startDate);
            const standardEndDate = new Date(applicableStandard.endDate);
            // 計算該年度需要生成的月份範圍
            let startMonth = 0; // 預設從1月開始
            let endMonth = 11; // 預設到12月結束
            // 如果是合約開始年份，從合約開始月份開始
            if (year === standardStartDate.getFullYear()) {
                startMonth = standardStartDate.getMonth();
            }
            // 如果是合約結束年份，要包含到結束日期所在月份
            if (year === standardEndDate.getFullYear()) {
                endMonth = standardEndDate.getMonth();
            }
            // 生成租金收款項目
            const newPayments = [];
            for (let month = startMonth; month <= endMonth; month++) {
                const paymentStartDate = new Date(year, month, 1);
                const paymentEndDate = new Date(year, month + 1, 0);
                const payment = {
                    id: crypto.randomUUID(),
                    investmentId,
                    year,
                    month: month + 1,
                    amount: applicableStandard.monthlyRent,
                    startDate: paymentStartDate.toISOString(),
                    endDate: paymentEndDate.toISOString(),
                    renterName: applicableStandard.renterName,
                    renterTaxId: applicableStandard.renterTaxId,
                    payerName: applicableStandard.renterName, // 預設繳款人同承租人
                    status: rental_1.PaymentStatus.PENDING,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                newPayments.push(payment);
            }
            // 儲存新生成的租金收款項目
            ApiService.mockRentalPayments = [
                ...ApiService.mockRentalPayments,
                ...newPayments
            ];
            await ApiService.saveRentalPaymentsToStorage();
        }
        catch (error) {
            console.error('生成租金收款項目時發生錯誤:', error);
            throw error;
        }
    }
    static async updateRentalPayment(id, data) {
        const index = ApiService.mockRentalPayments.findIndex(p => p.id === id);
        if (index === -1)
            throw new Error('租金收款項目不存在');
        const updatedPayment = {
            ...ApiService.mockRentalPayments[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        ApiService.mockRentalPayments[index] = updatedPayment;
        ApiService.saveRentalPaymentsToStorage();
        return Promise.resolve(updatedPayment);
    }
    static async deleteRentalPayment(id) {
        const index = ApiService.mockRentalPayments.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Rental payment not found');
        }
        ApiService.mockRentalPayments.splice(index, 1);
        ApiService.saveRentalPaymentsToStorage();
        return Promise.resolve();
    }
    static async clearRentalPayments(year, month) {
        console.log(`開始清除租金收款記錄 - 年度: ${year}, 月份: ${month}`);
        try {
            if (!year) {
                // 如果沒有指定年份，則不執行任何操作
                return Promise.resolve();
            }
            // 確保先載入數據
            if (ApiService.mockRentalPayments.length === 0) {
                ApiService.loadRentalPaymentsFromStorage();
            }
            const beforeCount = ApiService.mockRentalPayments.length;
            if (month) {
                // 如果指定了月份，則只清除該年份和月份的租金項目
                ApiService.mockRentalPayments = ApiService.mockRentalPayments.filter(payment => payment.year !== year || payment.month !== month);
            }
            else {
                // 如果只指定了年份，則清除該年份的所有租金項目
                ApiService.mockRentalPayments = ApiService.mockRentalPayments.filter(payment => payment.year !== year);
            }
            const afterCount = ApiService.mockRentalPayments.length;
            const deletedCount = beforeCount - afterCount;
            console.log(`租金收款記錄清除完成：刪除 ${deletedCount} 筆記錄`);
            // 保存到本地存儲
            ApiService.saveRentalPaymentsToStorage();
            // 返回成功訊息
            return Promise.resolve();
        }
        catch (error) {
            console.error('清除租金收款記錄時發生錯誤:', error);
            return Promise.reject(error);
        }
    }
    // 會員分潤項目相關方法
    static loadMemberProfitsFromStorage() {
        const storedProfits = localStorage.getItem('memberProfits');
        if (storedProfits) {
            ApiService.mockMemberProfits = JSON.parse(storedProfits);
        }
        else {
            ApiService.mockMemberProfits = [];
        }
    }
    static saveMemberProfitsToStorage() {
        localStorage.setItem('memberProfits', JSON.stringify(ApiService.mockMemberProfits));
    }
    static async getMemberProfits(investmentId, memberId, year, month) {
        if (ApiService.mockMemberProfits.length === 0) {
            ApiService.loadMemberProfitsFromStorage();
        }
        // 直接複製陣列而不使用擴展運算符
        const profits = [];
        // 逐個複製物件所有屬性
        for (const profit of ApiService.mockMemberProfits) {
            const newProfit = {
                id: profit.id,
                investmentId: profit.investmentId,
                memberId: profit.memberId,
                year: profit.year,
                month: profit.month,
                amount: Number(profit.amount),
                status: profit.status,
                paymentDate: profit.paymentDate,
                paymentMethod: profit.paymentMethod,
                note: profit.note,
                createdAt: profit.createdAt,
                updatedAt: profit.updatedAt
            };
            profits.push(newProfit);
        }
        // 依序套用篩選條件
        let filteredProfits = profits;
        if (investmentId) {
            filteredProfits = filteredProfits.filter(p => p.investmentId === investmentId);
        }
        if (memberId) {
            filteredProfits = filteredProfits.filter(p => p.memberId === memberId);
        }
        if (year) {
            filteredProfits = filteredProfits.filter(p => p.year === year);
        }
        if (month) {
            filteredProfits = filteredProfits.filter(p => p.month === month);
        }
        return Promise.resolve(filteredProfits);
    }
    static async generateMemberProfits(investmentId, year) {
        try {
            // 載入資料
            ApiService.loadRentalStandardsFromStorage();
            ApiService.loadRentalPaymentsFromStorage();
            ApiService.loadMemberProfitsFromStorage();
            console.log('生成會員分潤項目 - 開始', { investmentId, year });
            // 檢查是否已存在該投資項目的分潤項目
            const existingProfits = ApiService.mockMemberProfits.filter(p => p.investmentId === investmentId && p.year === year);
            if (existingProfits.length > 0) {
                console.warn('該投資項目已存在分潤項目:', existingProfits.length, '筆');
                throw new Error('該投資項目的分潤項目已存在，請勿重複生成');
            }
            // 獲取投資項目
            const investment = await this.getInvestment(investmentId);
            console.log('投資項目', (investment === null || investment === void 0 ? void 0 : investment.name) || (investment === null || investment === void 0 ? void 0 : investment.id) || '未找到');
            if (!investment) {
                console.error('找不到投資項目:', investmentId);
                throw new Error('找不到投資項目');
            }
            // 檢查投資項目是否有指定會員
            if (!investment.userId) {
                console.error('投資項目未指定所屬會員:', investment.id, investment.name);
                throw new Error('投資項目未指定所屬會員');
            }
            console.log('投資項目所屬會員 ID', investment.userId);
            // 載入會員資料
            const members = await this.getMembers();
            console.log('載入會員資料, 共', members.length, '位會員');
            console.log('所有會員 ID:', members.map(m => m.id));
            const member = members.find(m => m.id === investment.userId);
            if (!member) {
                console.error('投資項目所屬會員: 未找到');
                console.error('找不到會員:', investment.userId);
                // 嘗試更新投資項目關聯到存在的會員
                if (members.length > 0) {
                    console.log('嘗試將投資項目關聯到現有會員...');
                    const availableMember = members[0];
                    // 更新投資項目的會員ID
                    try {
                        const updatedInvestment = await this.updateInvestment({
                            ...investment,
                            userId: availableMember.id
                        });
                        console.log(`已更新投資項目 ${investment.name} 關聯到會員 ${availableMember.name}(${availableMember.id})`);
                        // 使用更新後的會員繼續處理
                        return this.generateMemberProfits(investmentId, year);
                    }
                    catch (error) {
                        console.error('更新投資項目失敗:', error);
                        throw new Error('更新投資項目失敗');
                    }
                }
                throw new Error('找不到所屬會員，請確保投資項目已正確關聯到現有會員');
            }
            console.log('找到投資項目所屬會員:', member.name, `(${member.id})`);
            // 載入該年度的租金收款項目
            const rentalPayments = ApiService.mockRentalPayments.filter(p => p.investmentId === investmentId && p.year === year);
            console.log('找到租金收款項目:', rentalPayments.length, '筆');
            if (rentalPayments.length === 0) {
                console.error('未找到租金收款項目:', { investmentId, year });
                throw new Error('未找到該投資項目的租金收款項目');
            }
            // 載入分潤標準
            const standards = await this.getProfitSharingStandards(investmentId);
            console.log('載入分潤標準:', standards.length, '筆');
            if (standards.length === 0) {
                console.error('未設定分潤標準:', { investmentId });
                throw new Error('未設定分潤標準');
            }
            const newProfits = [];
            for (const standard of standards) {
                const startDate = new Date(standard.startDate);
                const endDate = standard.endDate ? new Date(standard.endDate) : new Date(year, 11, 31);
                console.log('處理分潤標準', {
                    標準ID: standard.id,
                    標準開始日期: startDate.toISOString().split('T')[0],
                    標準結束日期: endDate.toISOString().split('T')[0],
                    年度: year
                });
                // 跳過不適用的分潤標準
                if (startDate.getFullYear() > year || endDate.getFullYear() < year) {
                    console.log('跳過不適用的分潤標準', {
                        標準ID: standard.id,
                        標準開始年度: startDate.getFullYear(),
                        標準結束年度: endDate.getFullYear(),
                        目標年度: year
                    });
                    continue;
                }
                // 計算適用的月份範圍
                const startMonth = startDate.getFullYear() === year ? startDate.getMonth() + 1 : 1;
                const endMonth = endDate.getFullYear() === year ? endDate.getMonth() + 1 : 12;
                console.log('計算適用的月份範圍', {
                    標準ID: standard.id,
                    開始月份: startMonth,
                    結束月份: endMonth
                });
                // 只為指定的會員生成分潤項目
                let generatedCount = 0;
                for (let month = startMonth; month <= endMonth; month++) {
                    // 查找對應月份的租金收款項目
                    const rentalPayment = rentalPayments.find(p => p.month === month);
                    if (!rentalPayment) {
                        console.warn('找不到對應月份的租金收款項目', {
                            月份: month
                        });
                        continue;
                    }
                    console.log('找到對應月份的租金收款項目', {
                        月份: month,
                        租金ID: rentalPayment.id,
                        金額: rentalPayment.amount
                    });
                    // 計算分潤金額
                    let amount = 0;
                    if (standard.type === rental_1.ProfitSharingType.FIXED_AMOUNT) {
                        amount = standard.value;
                        console.log('使用固定金額分潤:', standard.value);
                    }
                    else if (standard.type === rental_1.ProfitSharingType.PERCENTAGE) {
                        // 使用租金收款金額計算分潤
                        amount = rentalPayment.amount * (standard.value / 100);
                        console.log('使用百分比計算分潤:', {
                            百分比: standard.value,
                            計算結果: amount
                        });
                    }
                    // 應用最小/最大金額限制
                    let originalAmount = amount;
                    if (standard.minAmount !== undefined) {
                        amount = Math.max(amount, standard.minAmount);
                        if (amount !== originalAmount) {
                            console.log('應用最小金額限制:', {
                                原始金額: originalAmount,
                                最小限制: standard.minAmount,
                                調整後: amount
                            });
                        }
                    }
                    originalAmount = amount;
                    if (standard.maxAmount !== undefined) {
                        amount = Math.min(amount, standard.maxAmount);
                        if (amount !== originalAmount) {
                            console.log('應用最大金額限制:', {
                                原始金額: originalAmount,
                                最大限制: standard.maxAmount,
                                調整後: amount
                            });
                        }
                    }
                    // 這裡進行四捨五入，避免小數點問題
                    amount = Math.round(amount);
                    console.log(`${month}月份最終分潤金額:`, amount);
                    const profit = {
                        id: crypto.randomUUID(),
                        investmentId,
                        memberId: member.id,
                        year,
                        month,
                        amount,
                        status: rental_1.PaymentStatus.PENDING,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    newProfits.push(profit);
                    generatedCount++;
                }
                console.log(`依照分潤標準 ${standard.id} 生成了 ${generatedCount} 筆分潤記錄`);
            }
            console.log(`總共生成 ${newProfits.length} 筆會員分潤項目`);
            if (newProfits.length === 0) {
                console.error('無法生成分潤項目:', { investmentId, year });
                throw new Error('無法生成分潤項目，請檢查分潤標準的生效日期');
            }
            // 添加新生成的分潤項目
            ApiService.mockMemberProfits.push(...newProfits);
            ApiService.saveMemberProfitsToStorage();
            console.log('分潤項目已保存到本地存儲');
            return Promise.resolve(newProfits);
        }
        catch (error) {
            console.error('生成會員分潤項目失敗:', error);
            return Promise.reject(error);
        }
    }
    static async updateMemberProfit(id, data) {
        const index = ApiService.mockMemberProfits.findIndex(p => p.id === id);
        if (index === -1)
            throw new Error('會員分潤項目不存在');
        const updatedProfit = {
            ...ApiService.mockMemberProfits[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        ApiService.mockMemberProfits[index] = updatedProfit;
        ApiService.saveMemberProfitsToStorage();
        return Promise.resolve(updatedProfit);
    }
    static async deleteMemberProfit(id) {
        const index = ApiService.mockMemberProfits.findIndex(p => p.id === id);
        if (index === -1)
            throw new Error('會員分潤項目不存在');
        ApiService.mockMemberProfits.splice(index, 1);
        ApiService.saveMemberProfitsToStorage();
        return Promise.resolve();
    }
    static async clearMemberProfits(year) {
        console.log(`開始清除會員分潤記錄 - 年度: ${year}`);
        try {
            // 確保先載入數據
            if (ApiService.mockMemberProfits.length === 0) {
                ApiService.loadMemberProfitsFromStorage();
            }
            if (year) {
                const beforeCount = ApiService.mockMemberProfits.length;
                // 如果指定了年份，只清除該年度的分潤項目
                ApiService.mockMemberProfits = ApiService.mockMemberProfits.filter(profit => profit.year !== year);
                const afterCount = ApiService.mockMemberProfits.length;
                const deletedCount = beforeCount - afterCount;
                console.log(`會員分潤記錄清除完成：刪除 ${deletedCount} 筆記錄`);
            }
            else {
                // 如果沒有指定年份，清除所有分潤項目
                const beforeCount = ApiService.mockMemberProfits.length;
                ApiService.mockMemberProfits = [];
                console.log(`會員分潤記錄清除完成：刪除所有 ${beforeCount} 筆記錄`);
            }
            // 確保更新 localStorage
            ApiService.saveMemberProfitsToStorage();
            // 返回成功訊息
            return Promise.resolve();
        }
        catch (error) {
            console.error('清除會員分潤記錄時發生錯誤:', error);
            return Promise.reject(error);
        }
    }
    // 會員相關方法
    static async getMembers() {
        return Promise.resolve(ApiService.mockMembers);
    }
    static async getMember(id) {
        const member = ApiService.mockMembers.find(m => m.id === id);
        if (!member) {
            throw new Error('會員不存在');
        }
        return Promise.resolve(member);
    }
    static async createMember(data) {
        const response = await this.post('/members', data);
        return response.data;
    }
    static async updateMember(id, data) {
        const response = await this.put(`/members/${id}`, data);
        return response.data;
    }
    static async deleteMember(id) {
        await this.delete(`/members/${id}`);
    }
    static getAuthToken() {
        return localStorage.getItem(this.LOCAL_STORAGE_KEY);
    }
    static setAuthToken(token) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, token);
    }
    static clearAuthToken() {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
    static async get(url) {
        const token = this.getAuthToken();
        return axios_1.default.get(`${this.API_BASE_URL}${url}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
    static async post(url, data) {
        const token = this.getAuthToken();
        return axios_1.default.post(`${this.API_BASE_URL}${url}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
    static async put(url, data) {
        const token = this.getAuthToken();
        return axios_1.default.put(`${this.API_BASE_URL}${url}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
    static async delete(url) {
        const token = this.getAuthToken();
        return axios_1.default.delete(`${this.API_BASE_URL}${url}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
    static loadInvoicesFromStorage() {
        const storedInvoices = localStorage.getItem('invoices');
        if (storedInvoices) {
            ApiService.mockInvoices = JSON.parse(storedInvoices);
        }
    }
    static saveInvoicesToStorage() {
        localStorage.setItem('invoices', JSON.stringify(ApiService.mockInvoices));
    }
    static async createInvoice(data) {
        // 載入發票資料
        ApiService.loadInvoicesFromStorage();
        // 檢查是否已經開立過相同類型的發票
        const existingInvoice = ApiService.mockInvoices.find(inv => inv.paymentId === data.paymentId && inv.type === data.type);
        if (existingInvoice) {
            throw new Error(`此筆租金已開立過${data.type === 'receipt' ? '收據' : '發票'}`);
        }
        // 建立新發票
        const newInvoice = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // 儲存發票
        ApiService.mockInvoices.push(newInvoice);
        ApiService.saveInvoicesToStorage();
        // 更新租金收款狀態
        const paymentIndex = ApiService.mockRentalPayments.findIndex(p => p.id === data.paymentId);
        if (paymentIndex !== -1) {
            ApiService.mockRentalPayments[paymentIndex] = {
                ...ApiService.mockRentalPayments[paymentIndex],
                hasInvoice: true,
                updatedAt: new Date().toISOString()
            };
            ApiService.saveRentalPaymentsToStorage();
        }
        return Promise.resolve(newInvoice);
    }
    static async getInvoice(paymentId, type) {
        ApiService.loadInvoicesFromStorage();
        let invoice;
        if (type) {
            invoice = ApiService.mockInvoices.find(inv => inv.paymentId === paymentId && inv.type === type);
        }
        else {
            invoice = ApiService.mockInvoices.find(inv => inv.paymentId === paymentId);
        }
        return Promise.resolve(invoice || null);
    }
    static async getInvoices(investmentId, paymentId) {
        ApiService.loadInvoicesFromStorage();
        let invoices = [...ApiService.mockInvoices];
        if (investmentId) {
            invoices = invoices.filter(inv => inv.investmentId === investmentId);
        }
        if (paymentId) {
            invoices = invoices.filter(inv => inv.paymentId === paymentId);
        }
        return Promise.resolve(invoices);
    }
    static async deleteInvoice(id) {
        ApiService.loadInvoicesFromStorage();
        const index = ApiService.mockInvoices.findIndex(inv => inv.id === id);
        if (index === -1) {
            throw new Error('發票不存在');
        }
        const invoice = ApiService.mockInvoices[index];
        ApiService.mockInvoices.splice(index, 1);
        ApiService.saveInvoicesToStorage();
        // 檢查是否還有其他相同 paymentId 的發票
        const hasOtherInvoices = ApiService.mockInvoices.some(inv => inv.paymentId === invoice.paymentId);
        // 如果沒有其他發票，更新租金收款狀態
        if (!hasOtherInvoices) {
            const paymentIndex = ApiService.mockRentalPayments.findIndex(p => p.id === invoice.paymentId);
            if (paymentIndex !== -1) {
                ApiService.mockRentalPayments[paymentIndex] = {
                    ...ApiService.mockRentalPayments[paymentIndex],
                    hasInvoice: false,
                    updatedAt: new Date().toISOString()
                };
                ApiService.saveRentalPaymentsToStorage();
            }
        }
        return Promise.resolve();
    }
    // 添加直接清除本地存儲的方法
    static async purgeLocalStorage(year) {
        console.log(`直接清除本地存儲中的 ${year} 年度數據`);
        try {
            // 清除租金收款記錄
            let rentalPayments = [];
            const storedPayments = localStorage.getItem('rentalPayments');
            if (storedPayments) {
                try {
                    const allPayments = JSON.parse(storedPayments);
                    rentalPayments = allPayments.filter((payment) => payment.year !== year);
                    console.log(`租金收款：從 ${allPayments.length} 筆過濾到 ${rentalPayments.length} 筆`);
                    localStorage.setItem('rentalPayments', JSON.stringify(rentalPayments));
                }
                catch (e) {
                    console.error('解析租金收款數據時出錯:', e);
                }
            }
            // 清除會員分潤記錄
            let memberProfits = [];
            const storedProfits = localStorage.getItem('memberProfits');
            if (storedProfits) {
                try {
                    const allProfits = JSON.parse(storedProfits);
                    memberProfits = allProfits.filter((profit) => profit.year !== year);
                    console.log(`會員分潤：從 ${allProfits.length} 筆過濾到 ${memberProfits.length} 筆`);
                    localStorage.setItem('memberProfits', JSON.stringify(memberProfits));
                }
                catch (e) {
                    console.error('解析會員分潤數據時出錯:', e);
                }
            }
            // 同步更新內存中的數據
            ApiService.mockRentalPayments = rentalPayments;
            ApiService.mockMemberProfits = memberProfits;
            console.log(`${year} 年度數據已從本地存儲中清除`);
            return Promise.resolve();
        }
        catch (error) {
            console.error('清除本地存儲數據時出錯:', error);
            return Promise.reject(error);
        }
    }
    // 獲取會員逾期繳款記錄
    static async getOverdueMemberPayments() {
        if (ApiService.mockMemberProfits.length === 0) {
            ApiService.loadMemberProfitsFromStorage();
        }
        // 獲取當前日期
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        // 篩選出逾期的分潤記錄
        const overdueProfits = ApiService.mockMemberProfits.filter(profit => {
            // 如果已經標記為逾期，直接返回
            if (profit.status === rental_1.PaymentStatus.OVERDUE) {
                return true;
            }
            // 檢查是否已過期（已過了預期的付款月份）
            const isPastDue = (profit.year < currentYear) ||
                (profit.year === currentYear && profit.month < currentMonth);
            // 如果已過期並且尚未支付，則視為逾期
            return isPastDue && profit.status === rental_1.PaymentStatus.PENDING;
        });
        // 將狀態標記為逾期
        for (const profit of overdueProfits) {
            if (profit.status !== rental_1.PaymentStatus.OVERDUE) {
                const index = ApiService.mockMemberProfits.findIndex(p => p.id === profit.id);
                if (index !== -1) {
                    ApiService.mockMemberProfits[index].status = rental_1.PaymentStatus.OVERDUE;
                }
            }
        }
        // 儲存更新後的資料
        ApiService.saveMemberProfitsToStorage();
        return Promise.resolve(overdueProfits.map(profit => ({
            ...profit,
            amount: Number(profit.amount)
        })));
    }
    // 獲取客戶租金逾期繳款記錄
    static async getOverdueRentalPayments() {
        if (ApiService.mockRentalPayments.length === 0) {
            ApiService.loadRentalPaymentsFromStorage();
        }
        // 獲取當前日期
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        // 篩選出逾期的租金記錄
        const overduePayments = ApiService.mockRentalPayments.filter(payment => {
            // 如果已經標記為逾期，直接返回
            if (payment.status === rental_1.PaymentStatus.OVERDUE) {
                return true;
            }
            // 檢查是否已過期（已過了預期的繳款月份）
            const isPastDue = (payment.year < currentYear) ||
                (payment.year === currentYear && payment.month < currentMonth);
            // 如果已過期並且尚未繳款，則視為逾期
            return isPastDue && payment.status === rental_1.PaymentStatus.PENDING;
        });
        // 將狀態標記為逾期
        for (const payment of overduePayments) {
            if (payment.status !== rental_1.PaymentStatus.OVERDUE) {
                const index = ApiService.mockRentalPayments.findIndex(p => p.id === payment.id);
                if (index !== -1) {
                    ApiService.mockRentalPayments[index].status = rental_1.PaymentStatus.OVERDUE;
                }
            }
        }
        // 儲存更新後的資料
        ApiService.saveRentalPaymentsToStorage();
        return Promise.resolve(overduePayments.map(payment => ({
            ...payment,
            amount: Number(payment.amount)
        })));
    }
    // 記錄其他異常事件
    static async recordAnomaly(data) {
        // 從本地存儲獲取異常記錄
        const storedAnomalies = localStorage.getItem('anomalies') || '[]';
        const anomalies = JSON.parse(storedAnomalies);
        // 建立新的異常記錄
        const newAnomaly = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // 添加到列表並儲存
        anomalies.push(newAnomaly);
        localStorage.setItem('anomalies', JSON.stringify(anomalies));
        return Promise.resolve(newAnomaly);
    }
    // 獲取異常記錄列表
    static async getAnomalies() {
        const storedAnomalies = localStorage.getItem('anomalies') || '[]';
        return Promise.resolve(JSON.parse(storedAnomalies));
    }
    // 帳務管理功能
    // 日記帳功能
    static async getAccountRecords() {
        try {
            const response = await apiClient.get('/accounting/records');
            return response.data;
        }
        catch (error) {
            console.error('獲取帳務記錄失敗:', error);
            // 模擬數據
            return [];
        }
    }
    static async addAccountRecord(data) {
        try {
            const response = await apiClient.post('/accounting/records', data);
            return response.data;
        }
        catch (error) {
            console.error('添加帳務記錄失敗:', error);
            // 模擬數據
            return {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }
    static async updateAccountRecord(id, data) {
        try {
            const response = await apiClient.put(`/accounting/records/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新帳務記錄失敗:', error);
            // 模擬數據
            return { id, ...data, updatedAt: new Date().toISOString() };
        }
    }
    static async deleteAccountRecord(id) {
        try {
            await apiClient.delete(`/accounting/records/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除帳務記錄失敗:', error);
            return true; // 模擬成功
        }
    }
    // 應收帳款功能
    static async getReceivables() {
        try {
            const response = await apiClient.get('/accounting/receivables');
            return response.data;
        }
        catch (error) {
            console.error('獲取應收帳款失敗:', error);
            return []; // 模擬數據
        }
    }
    static async addReceivable(data) {
        try {
            const response = await apiClient.post('/accounting/receivables', data);
            return response.data;
        }
        catch (error) {
            console.error('添加應收帳款失敗:', error);
            // 模擬數據
            return {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }
    static async updateReceivable(id, data) {
        try {
            const response = await apiClient.put(`/accounting/receivables/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新應收帳款失敗:', error);
            // 模擬數據
            return { id, ...data, updatedAt: new Date().toISOString() };
        }
    }
    static async deleteReceivable(id) {
        try {
            await apiClient.delete(`/accounting/receivables/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除應收帳款失敗:', error);
            return true; // 模擬成功
        }
    }
    // 應付帳款功能
    static async getPayables() {
        try {
            const response = await apiClient.get('/accounting/payables');
            return response.data;
        }
        catch (error) {
            console.error('獲取應付帳款失敗:', error);
            return []; // 模擬數據
        }
    }
    static async addPayable(data) {
        try {
            const response = await apiClient.post('/accounting/payables', data);
            return response.data;
        }
        catch (error) {
            console.error('添加應付帳款失敗:', error);
            // 模擬數據
            return {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }
    static async updatePayable(id, data) {
        try {
            const response = await apiClient.put(`/accounting/payables/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新應付帳款失敗:', error);
            // 模擬數據
            return { id, ...data, updatedAt: new Date().toISOString() };
        }
    }
    static async deletePayable(id) {
        try {
            await apiClient.delete(`/accounting/payables/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除應付帳款失敗:', error);
            return true; // 模擬成功
        }
    }
    // 月結功能
    static async getMonthlyClosings() {
        try {
            const response = await apiClient.get('/accounting/monthly-closings');
            return response.data;
        }
        catch (error) {
            console.error('獲取月結記錄失敗:', error);
            return []; // 模擬數據
        }
    }
    static async getMonthlyClosingDetail(id) {
        try {
            const response = await apiClient.get(`/accounting/monthly-closings/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('獲取月結詳情失敗:', error);
            // 模擬數據
            return {};
        }
    }
    static async createMonthlyClosing(data) {
        try {
            const response = await apiClient.post('/accounting/monthly-closings', data);
            return response.data;
        }
        catch (error) {
            console.error('創建月結記錄失敗:', error);
            // 模擬數據
            return {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }
    static async finalizeMonthlyClosing(id) {
        try {
            const response = await apiClient.put(`/accounting/monthly-closings/${id}/finalize`);
            return response.data;
        }
        catch (error) {
            console.error('確認月結失敗:', error);
            // 模擬數據
            return { id, status: 'finalized', updatedAt: new Date().toISOString() };
        }
    }
    // 財務報表功能
    static async getFinancialReport(year, month) {
        try {
            const url = month ? `/accounting/reports/income-expense/${year}/${month}` : `/accounting/reports/income-expense/${year}`;
            const response = await apiClient.get(url);
            return response.data;
        }
        catch (error) {
            console.error('獲取財務報表失敗:', error);
            return {}; // 模擬數據
        }
    }
    static async getBalanceSheet(year, month) {
        try {
            const url = month ? `/accounting/reports/balance-sheet/${year}/${month}` : `/accounting/reports/balance-sheet/${year}`;
            const response = await apiClient.get(url);
            return response.data;
        }
        catch (error) {
            console.error('獲取資產負債表失敗:', error);
            return {}; // 模擬數據
        }
    }
    static async getCashFlowStatement(year, month) {
        try {
            const url = month ? `/accounting/reports/cash-flow/${year}/${month}` : `/accounting/reports/cash-flow/${year}`;
            const response = await apiClient.get(url);
            return response.data;
        }
        catch (error) {
            console.error('獲取現金流量表失敗:', error);
            return {}; // 模擬數據
        }
    }
    static async changeUserPassword(userId, newPassword) {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://asset-mgmt-api-test.onrender.com/api/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password: newPassword }),
        });
        if (!response.ok) {
            throw new Error('重設密碼失敗');
        }
    }
    // Fee Settings API methods
    static async getFeeSettings() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ApiService.API_BASE_URL}/fee-settings`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('載入會費標準失敗');
        }
        return await response.json();
    }
    static async createFeeSetting(data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ApiService.API_BASE_URL}/fee-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '新增會費標準失敗');
        }
        return await response.json();
    }
    static async updateFeeSetting(id, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ApiService.API_BASE_URL}/fee-settings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '更新會費標準失敗');
        }
        return await response.json();
    }
    static async deleteFeeSetting(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ApiService.API_BASE_URL}/fee-settings/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '刪除會費標準失敗');
        }
    }
    static async patchFeeSettingsOrder(orders) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${ApiService.API_BASE_URL}/fee-settings/reorder`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ orders }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '批次排序失敗');
        }
    }
}
exports.ApiService = ApiService;
ApiService.API_BASE_URL = (() => {
    if (typeof window === 'undefined')
        return '/api';
    // 優先使用環境配置
    if (window.ENV && window.ENV.API_URL) {
        return window.ENV.API_URL;
    }
    const hostname = window.location.hostname;
    const isRender = hostname.includes('render.com') || hostname.includes('onrender.com');
    const baseUrl = isRender
        ? 'https://asset-mgmt-api-clean.onrender.com/api' // 雲端後端 API 地址
        : (hostname === 'localhost' || hostname === '127.0.0.1'
            ? '/api' // 本地開發環境
            : 'https://asset-mgmt-api-clean.onrender.com/api'); // 其他環境也用雲端地址
    console.log(`API 服務初始化 - 主機名稱: ${hostname}, 基礎 URL: ${baseUrl}, 是否在 Render: ${isRender}`);
    return baseUrl;
})();
ApiService.LOCAL_STORAGE_KEY = 'auth_token';
ApiService.mockUsers = [];
ApiService.mockCompanies = [];
ApiService.mockRentalStandards = [];
ApiService.mockProfitSharingStandards = [];
ApiService.mockRentalPayments = [];
ApiService.mockMemberProfits = [];
ApiService.mockMembers = [
    {
        id: '6e74484c-af9c-4a4e-be82-c91d65000c29',
        memberNo: 'C001',
        username: 'test',
        name: '測試會員',
        email: 'test@example.com',
        status: 'active',
        role: 'normal',
        preferences: [],
        isFirstLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'ad9bfa89-6ea5-43fa-92e8-9ecbfb5d69c5',
        memberNo: 'C002',
        username: 'lkt',
        name: 'LKT',
        email: 'lkt@example.com',
        status: 'active',
        role: 'normal',
        preferences: [],
        isFirstLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '68aa110c-3b7e-42f8-9a4f-ab63a5c152a6',
        memberNo: 'C003',
        username: 'bmw',
        name: 'BMW',
        email: 'bmw@example.com',
        status: 'active',
        role: 'normal',
        preferences: [],
        isFirstLogin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
ApiService.mockInvoices = [];
exports.ApiServiceInstance = ApiService.getInstance();
