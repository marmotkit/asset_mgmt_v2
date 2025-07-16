"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountingJournalService = void 0;
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
// 日記帳服務
exports.accountingJournalService = {
    // 取得所有日記帳記錄
    getJournalEntries: async () => {
        try {
            const response = await apiClient.get('/accounting/journal');
            return response.data;
        }
        catch (error) {
            console.error('取得日記帳記錄失敗:', error);
            throw error;
        }
    },
    // 取得單一日記帳記錄
    getJournalEntry: async (id) => {
        try {
            const response = await apiClient.get(`/accounting/journal/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('取得日記帳記錄失敗:', error);
            throw error;
        }
    },
    // 建立新日記帳記錄
    createJournalEntry: async (data) => {
        try {
            const response = await apiClient.post('/accounting/journal', data);
            return response.data;
        }
        catch (error) {
            console.error('建立日記帳記錄失敗:', error);
            throw error;
        }
    },
    // 更新日記帳記錄
    updateJournalEntry: async (id, data) => {
        try {
            const response = await apiClient.put(`/accounting/journal/${id}`, data);
            return response.data;
        }
        catch (error) {
            console.error('更新日記帳記錄失敗:', error);
            throw error;
        }
    },
    // 刪除日記帳記錄
    deleteJournalEntry: async (id) => {
        try {
            await apiClient.delete(`/accounting/journal/${id}`);
            return true;
        }
        catch (error) {
            console.error('刪除日記帳記錄失敗:', error);
            throw error;
        }
    },
    // 取得會計科目列表
    getAccounts: async () => {
        try {
            const response = await apiClient.get('/accounting/accounts');
            return response.data;
        }
        catch (error) {
            console.error('取得會計科目失敗:', error);
            throw error;
        }
    },
    // 取得交易類別列表
    getCategories: async () => {
        try {
            const response = await apiClient.get('/accounting/categories');
            return response.data;
        }
        catch (error) {
            console.error('取得交易類別失敗:', error);
            throw error;
        }
    }
};
