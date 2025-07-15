import { Company } from '../types/company';
import axios from 'axios';

class CompanyService {
    private readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'https://asset-mgmt-backend.onrender.com';

    private getAuthToken(): string | null {
        return localStorage.getItem('token');
    }

    async getCompanies(): Promise<Company[]> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/api/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data || [];
        } catch (error) {
            console.error('獲取公司列表失敗:', error);
            throw new Error('獲取公司列表失敗');
        }
    }

    async getCompanyById(companyId: string): Promise<Company | undefined> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/api/companies/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('獲取公司詳情失敗:', error);
            throw new Error('獲取公司詳情失敗');
        }
    }

    async createCompany(companyData: Partial<Company>): Promise<Company> {
        try {
            const token = this.getAuthToken();
            const response = await axios.post(`${this.API_BASE_URL}/api/companies`, companyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.company;
        } catch (error: any) {
            console.error('創建公司失敗:', error);
            const errorMessage = error.response?.data?.message || '創建公司失敗';
            throw new Error(errorMessage);
        }
    }

    async updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
        try {
            const token = this.getAuthToken();
            const response = await axios.put(`${this.API_BASE_URL}/api/companies/${companyId}`, companyData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.company;
        } catch (error: any) {
            console.error('更新公司失敗:', error);
            const errorMessage = error.response?.data?.message || '更新公司失敗';
            throw new Error(errorMessage);
        }
    }

    async deleteCompany(companyId: string): Promise<void> {
        try {
            const token = this.getAuthToken();
            await axios.delete(`${this.API_BASE_URL}/api/companies/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error: any) {
            console.error('刪除公司失敗:', error);
            const errorMessage = error.response?.data?.message || '刪除公司失敗';
            throw new Error(errorMessage);
        }
    }

    async getNewCompanyNo(): Promise<string> {
        try {
            const companies = await this.getCompanies();
            const count = companies.length;
            const paddedCount = String(count + 1).padStart(3, '0');
            return `C${paddedCount}`;
        } catch (error) {
            console.error('生成公司編號失敗:', error);
            // 如果無法獲取公司列表，返回預設編號
            return 'C001';
        }
    }
}

export const companyService = new CompanyService(); 