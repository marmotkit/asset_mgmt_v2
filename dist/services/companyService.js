"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const axios_1 = __importDefault(require("axios"));
class CompanyService {
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
    async getCompanies() {
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.get(`${this.API_BASE_URL}/api/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data || [];
        }
        catch (error) {
            console.error('獲取公司列表失敗:', error);
            throw new Error('獲取公司列表失敗');
        }
    }
    async getCompanyById(companyId) {
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.get(`${this.API_BASE_URL}/api/companies/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('獲取公司詳情失敗:', error);
            throw new Error('獲取公司詳情失敗');
        }
    }
    async createCompany(companyData) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.post(`${this.API_BASE_URL}/api/companies`, companyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.company;
        }
        catch (error) {
            console.error('創建公司失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '創建公司失敗';
            throw new Error(errorMessage);
        }
    }
    async updateCompany(companyId, companyData) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            const response = await axios_1.default.put(`${this.API_BASE_URL}/api/companies/${companyId}`, companyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.company;
        }
        catch (error) {
            console.error('更新公司失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '更新公司失敗';
            throw new Error(errorMessage);
        }
    }
    async deleteCompany(companyId) {
        var _a, _b;
        try {
            const token = this.getAuthToken();
            await axios_1.default.delete(`${this.API_BASE_URL}/api/companies/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        catch (error) {
            console.error('刪除公司失敗:', error);
            const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || '刪除公司失敗';
            throw new Error(errorMessage);
        }
    }
    async getNewCompanyNo() {
        try {
            const companies = await this.getCompanies();
            const count = companies.length;
            const paddedCount = String(count + 1).padStart(3, '0');
            return `C${paddedCount}`;
        }
        catch (error) {
            console.error('生成公司編號失敗:', error);
            // 如果無法獲取公司列表，返回預設編號
            return 'C001';
        }
    }
}
exports.companyService = new CompanyService();
