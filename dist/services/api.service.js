"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServiceInstance = exports.ApiService = exports.apiClient = void 0;
const memberNoGenerator_1 = require("../utils/memberNoGenerator");
const axios_1 = __importDefault(require("axios"));
const rental_1 = require("../types/rental");
// 設置一個axios實例
exports.apiClient = axios_1.default.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// 添加請求攔截器，用於設置JWT token
exports.apiClient.interceptors.request.use((config) => {
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
            const response = await exports.apiClient.get('/investments');
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
            const response = await exports.apiClient.get(`/investments/${id}`);
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
            const response = await exports.apiClient.post('/investments', investment);
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
            const response = await exports.apiClient.put(`/investments/${investment.id}`, investment);
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
            await exports.apiClient.delete(`/investments/${id}`);
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
        try {
            const params = investmentId ? `?investmentId=${investmentId}` : '';
            const response = await exports.apiClient.get(`/rental-standards${params}`);
            return response.data;
        }
        catch (error) {
            console.error('獲取租賃標準失敗:', error);
            throw new Error('獲取租賃標準失敗');
        }
    }
    static async createRentalStandard(data) {
        try {
            const response = await exports.apiClient.post('/rental-standards', data);
            return response.data;
        }
        catch (error) {
            console.error('創建租賃標準失敗:', error);
            throw new Error('創建租賃標準失敗');
        }
    }
    static async updateRentalStandard(id, data) {
        try {
            const response = await exports.apiClient.put(`/rental-standards/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新租賃標準失敗:', error);
            throw new Error('更新租賃標準失敗');
        }
    }
    static async deleteRentalStandard(id) {
        try {
            await exports.apiClient.delete(`/rental-standards/${id}`);
        }
        catch (error) {
            console.error('刪除租賃標準失敗:', error);
            throw new Error('刪除租賃標準失敗');
        }
    }
    // 分潤標準設定相關方法
    static async getProfitSharingStandards(investmentId) {
        try {
            const params = investmentId ? `?investmentId=${investmentId}` : '';
            const response = await exports.apiClient.get(`/profit-sharing-standards${params}`);
            return response.data;
        }
        catch (error) {
            console.error('獲取分潤標準失敗:', error);
            throw new Error('獲取分潤標準失敗');
        }
    }
    static async getAvailableInvestmentsForProfitSharing() {
        try {
            const response = await exports.apiClient.get('/profit-sharing-standards/available-investments');
            return response.data;
        }
        catch (error) {
            console.error('獲取有租賃標準的投資項目失敗:', error);
            throw new Error('獲取有租賃標準的投資項目失敗');
        }
    }
    static async getAvailableInvestmentsForRentalPayments() {
        try {
            const response = await exports.apiClient.get('/rental-standards/available-investments');
            return response.data;
        }
        catch (error) {
            console.error('獲取有租賃標準的投資項目失敗:', error);
            throw new Error('獲取有租賃標準的投資項目失敗');
        }
    }
    static async createProfitSharingStandard(data) {
        try {
            const response = await exports.apiClient.post('/profit-sharing-standards', data);
            return response.data;
        }
        catch (error) {
            console.error('創建分潤標準失敗:', error);
            throw new Error('創建分潤標準失敗');
        }
    }
    static async updateProfitSharingStandard(id, data) {
        try {
            const response = await exports.apiClient.put(`/profit-sharing-standards/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新分潤標準失敗:', error);
            throw new Error('更新分潤標準失敗');
        }
    }
    static async deleteProfitSharingStandard(id) {
        try {
            await exports.apiClient.delete(`/profit-sharing-standards/${id}`);
        }
        catch (error) {
            console.error('刪除分潤標準失敗:', error);
            throw new Error('刪除分潤標準失敗');
        }
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
        try {
            const params = new URLSearchParams();
            if (investmentId)
                params.append('investmentId', investmentId);
            if (year)
                params.append('year', year.toString());
            if (month)
                params.append('month', month.toString());
            const response = await this.get(`/rental-payments?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            console.error('獲取租金收款項目失敗:', error);
            return [];
        }
    }
    static async generateRentalPayments(investmentId, year) {
        try {
            const response = await this.post('/rental-payments/generate', {
                investmentId,
                year
            });
            return response.data;
        }
        catch (error) {
            console.error('生成租金收款項目失敗:', error);
            throw error;
        }
    }
    static async updateRentalPayment(id, data) {
        try {
            const response = await this.put(`/rental-payments/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新租金收款項目失敗:', error);
            throw new Error('更新租金收款項目失敗');
        }
    }
    static async deleteRentalPayment(id) {
        try {
            await this.delete(`/rental-payments/${id}`);
        }
        catch (error) {
            console.error('刪除租金收款項目失敗:', error);
            throw new Error('刪除租金收款項目失敗');
        }
    }
    static async clearRentalPayments(year, month) {
        try {
            if (!year) {
                return Promise.resolve();
            }
            let url = `/rental-payments/clear/${year}`;
            if (month !== undefined) {
                url += `/${month}`;
            }
            await this.delete(url);
        }
        catch (error) {
            console.error('清除租金收款記錄失敗:', error);
            throw error;
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
        try {
            const params = new URLSearchParams();
            if (investmentId)
                params.append('investmentId', investmentId);
            if (memberId)
                params.append('memberId', memberId);
            if (year)
                params.append('year', year.toString());
            if (month)
                params.append('month', month.toString());
            const response = await this.get(`/member-profits?${params.toString()}`);
            return response.data;
        }
        catch (error) {
            console.error('獲取會員分潤列表失敗:', error);
            return [];
        }
    }
    static async generateMemberProfits(investmentId, year) {
        try {
            const response = await this.post('/member-profits/generate', {
                investmentId,
                year
            });
            console.log('生成會員分潤項目成功:', response.data);
            // 返回空陣列，因為生成的項目會通過 getMemberProfits 方法獲取
            return [];
        }
        catch (error) {
            console.error('生成會員分潤項目失敗:', error);
            throw error;
        }
    }
    static async updateMemberProfit(id, data) {
        try {
            const response = await this.put(`/member-profits/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新會員分潤項目失敗:', error);
            throw error;
        }
    }
    static async deleteMemberProfit(id) {
        try {
            await this.delete(`/member-profits/${id}`);
        }
        catch (error) {
            console.error('刪除會員分潤項目失敗:', error);
            throw error;
        }
    }
    static async clearMemberProfits(year) {
        try {
            const params = new URLSearchParams();
            if (year)
                params.append('year', year.toString());
            await this.delete(`/member-profits/clear-all?${params.toString()}`);
        }
        catch (error) {
            console.error('清除會員分潤記錄失敗:', error);
            throw error;
        }
    }
    // 獲取可用於生成分潤的投資項目（有租賃標準和分潤標準的）
    static async getAvailableInvestmentsForMemberProfits() {
        try {
            const response = await this.get('/member-profits/available-investments');
            return response.data;
        }
        catch (error) {
            console.error('獲取可用於生成分潤的投資項目失敗:', error);
            return [];
        }
    }
    // 會員相關方法
    static async getMembers() {
        try {
            const response = await this.get('/users');
            return response.data;
        }
        catch (error) {
            console.error('獲取會員資料失敗:', error);
            return [];
        }
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
        try {
            console.log('【API】調用真實 API 獲取會員逾期繳款記錄');
            const response = await this.get('/risk-management/member-overdue-payments');
            console.log('【API】會員逾期繳款記錄回應:', response);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('【API】獲取會員逾期繳款記錄失敗:', error);
            return [];
        }
    }
    // 獲取客戶租金逾期繳款記錄
    static async getOverdueRentalPayments() {
        try {
            console.log('【API】調用真實 API 獲取客戶租金逾期繳款記錄');
            const response = await this.get('/risk-management/rental-overdue-payments');
            console.log('【API】客戶租金逾期繳款記錄回應:', response);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('【API】獲取客戶租金逾期繳款記錄失敗:', error);
            return [];
        }
    }
    // 記錄其他異常事件
    static async recordAnomaly(data) {
        try {
            console.log('【API】調用真實 API 新增異常記錄');
            const response = await this.post('/anomalies', data);
            console.log('【API】新增異常記錄回應:', response);
            return response.data;
        }
        catch (error) {
            console.error('【API】新增異常記錄失敗:', error);
            throw error;
        }
    }
    // 獲取異常記錄列表
    static async getAnomalies() {
        try {
            console.log('【API】調用真實 API 獲取異常記錄');
            const response = await this.get('/anomalies');
            console.log('【API】異常記錄回應:', response);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('【API】獲取異常記錄失敗:', error);
            return [];
        }
    }
    // 獲取單一異常記錄
    static async getAnomaly(id) {
        try {
            console.log('【API】調用真實 API 獲取異常記錄詳情');
            const response = await this.get(`/anomalies/${id}`);
            console.log('【API】異常記錄詳情回應:', response);
            return response.data;
        }
        catch (error) {
            console.error('【API】獲取異常記錄詳情失敗:', error);
            throw error;
        }
    }
    // 更新異常記錄
    static async updateAnomaly(id, data) {
        try {
            console.log('【API】調用真實 API 更新異常記錄');
            const response = await this.put(`/anomalies/${id}`, data);
            console.log('【API】更新異常記錄回應:', response);
            return response.data;
        }
        catch (error) {
            console.error('【API】更新異常記錄失敗:', error);
            throw error;
        }
    }
    // 獲取異常記錄修改歷史
    static async getAnomalyChanges(id) {
        try {
            console.log('【API】調用真實 API 獲取異常記錄修改歷史');
            const response = await this.get(`/anomalies/${id}/changes`);
            console.log('【API】異常記錄修改歷史回應:', response);
            return Array.isArray(response.data) ? response.data : [];
        }
        catch (error) {
            console.error('【API】獲取異常記錄修改歷史失敗:', error);
            return [];
        }
    }
    // 帳務管理功能
    // 日記帳功能
    static async getAccountRecords() {
        try {
            const response = await exports.apiClient.get('/accounting/records');
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
            const response = await exports.apiClient.post('/accounting/records', data);
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
            const response = await exports.apiClient.put(`/accounting/records/${id}`, data);
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
            await exports.apiClient.delete(`/accounting/records/${id}`);
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
            const response = await exports.apiClient.get('/accounting/receivables');
            return response.data;
        }
        catch (error) {
            console.error('獲取應收帳款失敗:', error);
            return []; // 模擬數據
        }
    }
    static async addReceivable(data) {
        try {
            const response = await exports.apiClient.post('/accounting/receivables', data);
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
            const response = await exports.apiClient.put(`/accounting/receivables/${id}`, data);
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
            await exports.apiClient.delete(`/accounting/receivables/${id}`);
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
            const response = await exports.apiClient.get('/accounting/payables');
            return response.data;
        }
        catch (error) {
            console.error('獲取應付帳款失敗:', error);
            return []; // 模擬數據
        }
    }
    static async addPayable(data) {
        try {
            const response = await exports.apiClient.post('/accounting/payables', data);
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
            const response = await exports.apiClient.put(`/accounting/payables/${id}`, data);
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
            await exports.apiClient.delete(`/accounting/payables/${id}`);
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
            const response = await exports.apiClient.get('/accounting/monthly-closings');
            return response.data;
        }
        catch (error) {
            console.error('獲取月結記錄失敗:', error);
            return []; // 模擬數據
        }
    }
    static async getMonthlyClosingDetail(id) {
        try {
            const response = await exports.apiClient.get(`/accounting/monthly-closings/${id}`);
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
            const response = await exports.apiClient.post('/accounting/monthly-closings', data);
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
            const response = await exports.apiClient.put(`/accounting/monthly-closings/${id}/finalize`);
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
            const response = await exports.apiClient.get(url);
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
            const response = await exports.apiClient.get(url);
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
            const response = await exports.apiClient.get(url);
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
ApiService.LOCAL_STORAGE_KEY = 'token';
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
