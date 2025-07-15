"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const axios_1 = __importDefault(require("axios"));
class UserService {
    constructor() {
        this.API_BASE_URL = (() => {
            if (typeof window === 'undefined')
                return 'https://asset-mgmt-backend.onrender.com';
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
            return baseUrl;
        })();
    }
    getAuthToken() {
        return localStorage.getItem('token');
    }
    async getUsers() {
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.get(`${this.API_BASE_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data || [];
        }
        catch (error) {
            console.error('獲取用戶列表失敗:', error);
            throw new Error('獲取用戶列表失敗');
        }
    }
    async getUserById(userId) {
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.get(`${this.API_BASE_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('獲取用戶詳情失敗:', error);
            throw new Error('獲取用戶詳情失敗');
        }
    }
    async createUser(userData) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.post(`${this.API_BASE_URL}/users`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('創建用戶失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '創建用戶失敗';
            throw new Error(errorMessage);
        }
    }
    async updateUser(userId, userData) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.put(`${this.API_BASE_URL}/users/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('更新用戶失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '更新用戶失敗';
            throw new Error(errorMessage);
        }
    }
    async deleteUser(userId) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            await axios_1.default.delete(`${this.API_BASE_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        catch (error) {
            console.error('刪除用戶失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '刪除用戶失敗';
            throw new Error(errorMessage);
        }
    }
    async updateUserStatus(userId, status) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.put(`${this.API_BASE_URL}/users/${userId}`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('更新用戶狀態失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '更新用戶狀態失敗';
            throw new Error(errorMessage);
        }
    }
    async resetUserPassword(userId, newPassword) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            await axios_1.default.put(`${this.API_BASE_URL}/users/${userId}/password`, { password: newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            console.error('重設密碼失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '重設密碼失敗';
            throw new Error(errorMessage);
        }
    }
    async getUserPassword(userId) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.get(`${this.API_BASE_URL}/users/${userId}/password`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.password;
        }
        catch (error) {
            console.error('查詢密碼失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '查詢密碼失敗';
            throw new Error(errorMessage);
        }
    }
}
exports.userService = new UserService();
