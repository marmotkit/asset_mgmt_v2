"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentInquiryService = exports.investmentOpportunityService = void 0;
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
// 投資標的 API 服務
exports.investmentOpportunityService = {
    // 取得投資標的列表
    getInvestmentOpportunities: async (filter, sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 20) => {
        try {
            const params = {
                ...filter,
                sortBy,
                sortOrder,
                page,
                limit
            };
            const response = await apiClient.get('/investment-opportunities', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得投資標的列表失敗:', error);
            throw error;
        }
    },
    // 取得單一投資標的
    getInvestmentOpportunity: async (id) => {
        try {
            const response = await apiClient.get(`/investment-opportunities/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得投資標的失敗:', error);
            throw error;
        }
    },
    // 建立新投資標的
    createInvestmentOpportunity: async (data) => {
        try {
            const response = await apiClient.post('/investment-opportunities', data);
            return response.data;
        }
        catch (error) {
            console.error('建立投資標的失敗:', error);
            throw error;
        }
    },
    // 更新投資標的
    updateInvestmentOpportunity: async (id, data) => {
        try {
            const response = await apiClient.put(`/investment-opportunities/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新投資標的失敗:', error);
            throw error;
        }
    },
    // 刪除投資標的
    deleteInvestmentOpportunity: async (id) => {
        try {
            await apiClient.delete(`/investment-opportunities/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除投資標的失敗:', error);
            throw error;
        }
    },
    // 更新投資標的狀態
    updateInvestmentStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`/investment-opportunities/${id}/status`, { status });
            return response.data;
        }
        catch (error) {
            console.error('更新投資標的狀態失敗:', error);
            throw error;
        }
    },
    // 批量更新狀態
    batchUpdateStatus: async (ids, status) => {
        try {
            await apiClient.patch('/investment-opportunities/batch-status', { ids, status });
            return true;
        }
        catch (error) {
            console.error('批量更新狀態失敗:', error);
            throw error;
        }
    },
    // 增加瀏覽次數
    incrementViewCount: async (id) => {
        try {
            await apiClient.post(`/investment-opportunities/${id}/view`);
        }
        catch (error) {
            console.error('增加瀏覽次數失敗:', error);
            // 不拋出錯誤，避免影響用戶體驗
        }
    }
};
// 洽詢 API 服務
exports.investmentInquiryService = {
    // 取得洽詢列表
    getInquiries: async (investmentId, status, page = 1, limit = 20) => {
        try {
            const params = {
                investmentId,
                status,
                page,
                limit
            };
            const response = await apiClient.get('/investment-inquiries', { params });
            return response.data;
        }
        catch (error) {
            console.error('取得洽詢列表失敗:', error);
            throw error;
        }
    },
    // 取得單一洽詢
    getInquiry: async (id) => {
        try {
            const response = await apiClient.get(`/investment-inquiries/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得洽詢失敗:', error);
            throw error;
        }
    },
    // 建立新洽詢
    createInquiry: async (data) => {
        try {
            const response = await apiClient.post('/investment-inquiries', data);
            return response.data;
        }
        catch (error) {
            console.error('建立洽詢失敗:', error);
            throw error;
        }
    },
    // 更新洽詢
    updateInquiry: async (id, data) => {
        try {
            const response = await apiClient.put(`/investment-inquiries/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新洽詢失敗:', error);
            throw error;
        }
    },
    // 刪除洽詢
    deleteInquiry: async (id) => {
        try {
            await apiClient.delete(`/investment-inquiries/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除洽詢失敗:', error);
            throw error;
        }
    }
};
