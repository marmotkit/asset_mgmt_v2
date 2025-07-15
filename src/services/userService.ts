import { User } from '../types/user';
import axios from 'axios';

class UserService {
    private readonly API_BASE_URL = (() => {
        if (typeof window === 'undefined') return 'https://asset-mgmt-backend.onrender.com';

        // 優先使用環境配置
        if (window.ENV && window.ENV.API_URL) {
            return window.ENV.API_URL;
        }

        const hostname = window.location.hostname;
        const isRender = hostname.includes('render.com') || hostname.includes('onrender.com');
        const baseUrl = isRender
            ? 'https://asset-mgmt-api-clean.onrender.com/api'  // 雲端後端 API 地址
            : (hostname === 'localhost' || hostname === '127.0.0.1'
                ? '/api'  // 本地開發環境
                : 'https://asset-mgmt-api-clean.onrender.com/api'); // 其他環境也用雲端地址

        return baseUrl;
    })();

    private getAuthToken(): string | null {
        return localStorage.getItem('token');
    }

    async getUsers(): Promise<User[]> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data || [];
        } catch (error) {
            console.error('獲取用戶列表失敗:', error);
            throw new Error('獲取用戶列表失敗');
        }
    }

    async getUserById(userId: string): Promise<User | undefined> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('獲取用戶詳情失敗:', error);
            throw new Error('獲取用戶詳情失敗');
        }
    }

    async createUser(userData: Partial<User>): Promise<User> {
        try {
            const token = this.getAuthToken();
            const response = await axios.post(`${this.API_BASE_URL}/users`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('創建用戶失敗:', error);
            const errorMessage = error.response?.data?.message || '創建用戶失敗';
            throw new Error(errorMessage);
        }
    }

    async updateUser(userId: string, userData: Partial<User>): Promise<User> {
        try {
            const token = this.getAuthToken();
            const response = await axios.put(`${this.API_BASE_URL}/users/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('更新用戶失敗:', error);
            const errorMessage = error.response?.data?.message || '更新用戶失敗';
            throw new Error(errorMessage);
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            const token = this.getAuthToken();
            await axios.delete(`${this.API_BASE_URL}/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error: any) {
            console.error('刪除用戶失敗:', error);
            const errorMessage = error.response?.data?.message || '刪除用戶失敗';
            throw new Error(errorMessage);
        }
    }

    async updateUserStatus(userId: string, status: string): Promise<User> {
        try {
            const token = this.getAuthToken();
            const response = await axios.put(`${this.API_BASE_URL}/users/${userId}`, { status }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('更新用戶狀態失敗:', error);
            const errorMessage = error.response?.data?.message || '更新用戶狀態失敗';
            throw new Error(errorMessage);
        }
    }

    async resetUserPassword(userId: string, newPassword: string): Promise<void> {
        try {
            const token = this.getAuthToken();
            await axios.put(`${this.API_BASE_URL}/users/${userId}/password`, { password: newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            console.error('重設密碼失敗:', error);
            const errorMessage = error.response?.data?.message || '重設密碼失敗';
            throw new Error(errorMessage);
        }
    }

    async getUserPassword(userId: string): Promise<string> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/users/${userId}/password`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.password;
        } catch (error: any) {
            console.error('查詢密碼失敗:', error);
            const errorMessage = error.response?.data?.message || '查詢密碼失敗';
            throw new Error(errorMessage);
        }
    }
}

export const userService = new UserService(); 