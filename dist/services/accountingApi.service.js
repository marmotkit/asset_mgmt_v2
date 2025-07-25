"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialReportsApiService = exports.monthlyClosingApiService = exports.payablesApiService = exports.receivablesApiService = void 0;
const axios_1 = __importDefault(require("axios"));
// 設置 API 客戶端
const apiClient = axios_1.default.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://asset-mgmt-api-clean.onrender.com/api'
        : '/api',
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
// 應收帳款 API 服務
exports.receivablesApiService = {
    // 取得所有應收帳款
    getReceivables: async () => {
        try {
            const response = await apiClient.get('/accounting/receivables');
            return response.data.receivables || [];
        }
        catch (error) {
            console.error('取得應收帳款失敗:', error);
            throw error;
        }
    },
    // 取得單一應收帳款
    getReceivable: async (id) => {
        try {
            const response = await apiClient.get(`/accounting/receivables/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得應收帳款失敗:', error);
            throw error;
        }
    },
    // 建立新應收帳款
    createReceivable: async (data) => {
        try {
            const response = await apiClient.post('/accounting/receivables', data);
            return response.data;
        }
        catch (error) {
            console.error('建立應收帳款失敗:', error);
            throw error;
        }
    },
    // 更新應收帳款
    updateReceivable: async (id, data) => {
        try {
            const response = await apiClient.put(`/accounting/receivables/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新應收帳款失敗:', error);
            throw error;
        }
    },
    // 刪除應收帳款
    deleteReceivable: async (id) => {
        try {
            await apiClient.delete(`/accounting/receivables/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除應收帳款失敗:', error);
            throw error;
        }
    }
};
// 應付帳款 API 服務
exports.payablesApiService = {
    // 取得所有應付帳款
    getPayables: async () => {
        try {
            const response = await apiClient.get('/accounting/payables');
            return response.data.payables || [];
        }
        catch (error) {
            console.error('取得應付帳款失敗:', error);
            throw error;
        }
    },
    // 取得單一應付帳款
    getPayable: async (id) => {
        try {
            const response = await apiClient.get(`/accounting/payables/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得應付帳款失敗:', error);
            throw error;
        }
    },
    // 建立新應付帳款
    createPayable: async (data) => {
        try {
            const response = await apiClient.post('/accounting/payables', data);
            return response.data;
        }
        catch (error) {
            console.error('建立應付帳款失敗:', error);
            throw error;
        }
    },
    // 更新應付帳款
    updatePayable: async (id, data) => {
        try {
            const response = await apiClient.put(`/accounting/payables/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新應付帳款失敗:', error);
            throw error;
        }
    },
    // 刪除應付帳款
    deletePayable: async (id) => {
        try {
            await apiClient.delete(`/accounting/payables/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除應付帳款失敗:', error);
            throw error;
        }
    }
};
// 月結 API 服務
exports.monthlyClosingApiService = {
    // 取得所有月結記錄
    getMonthlyClosings: async () => {
        try {
            const response = await apiClient.get('/accounting/monthly-closings');
            return response.data.closings || [];
        }
        catch (error) {
            console.error('取得月結記錄失敗:', error);
            throw error;
        }
    },
    // 取得單一月結記錄
    getMonthlyClosing: async (id) => {
        try {
            const response = await apiClient.get(`/accounting/monthly-closings/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得月結記錄失敗:', error);
            throw error;
        }
    },
    // 建立新月結記錄
    createMonthlyClosing: async (data) => {
        try {
            const response = await apiClient.post('/accounting/monthly-closings/close', data);
            return response.data;
        }
        catch (error) {
            console.error('建立月結記錄失敗:', error);
            throw error;
        }
    },
    // 更新月結記錄
    updateMonthlyClosing: async (id, data) => {
        try {
            const response = await apiClient.put(`/accounting/monthly-closings/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新月結記錄失敗:', error);
            throw error;
        }
    },
    // 刪除月結記錄
    deleteMonthlyClosing: async (id) => {
        try {
            await apiClient.delete(`/accounting/monthly-closings/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除月結記錄失敗:', error);
            throw error;
        }
    }
};
// 財務報表 API 服務
exports.financialReportsApiService = {
    // 取得損益表
    getIncomeStatement: async (params) => {
        try {
            const response = await apiClient.get('/accounting/reports/income-statement', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得損益表失敗:', error);
            throw error;
        }
    },
    // 取得資產負債表
    getBalanceSheet: async (params) => {
        try {
            const response = await apiClient.get('/accounting/reports/balance-sheet', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得資產負債表失敗:', error);
            throw error;
        }
    },
    // 取得現金流量表
    getCashFlowStatement: async (params) => {
        try {
            const response = await apiClient.get('/accounting/reports/cash-flow', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得現金流量表失敗:', error);
            throw error;
        }
    },
    // 取得科目餘額表
    getTrialBalance: async (params) => {
        try {
            const response = await apiClient.get('/accounting/reports/trial-balance', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得科目餘額表失敗:', error);
            throw error;
        }
    }
};
