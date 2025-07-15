import { Company } from '../types/company';
import axios from 'axios';

class CompanyService {
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

    async getCompanies(): Promise<Company[]> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const companies = response.data || [];

            // 獲取所有用戶來計算會員數量
            try {
                const usersResponse = await axios.get(`${this.API_BASE_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const users = usersResponse.data || [];

                // 為每個公司計算會員數量
                const companiesWithMemberCount = companies.map((company: Company) => {
                    const memberCount = users.filter((user: any) => user.companyId === company.id).length;
                    return {
                        ...company,
                        memberCount
                    };
                });

                return companiesWithMemberCount;
            } catch (userError) {
                console.warn('無法獲取用戶資料來計算會員數量:', userError);
                // 如果無法獲取用戶資料，返回原始公司資料
                return companies;
            }
        } catch (error) {
            console.error('獲取公司列表失敗:', error);
            throw new Error('獲取公司列表失敗');
        }
    }

    async getCompanyById(companyId: string): Promise<Company | undefined> {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${this.API_BASE_URL}/companies/${companyId}`, {
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
            const response = await axios.post(`${this.API_BASE_URL}/companies`, companyData, {
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
            const response = await axios.put(`${this.API_BASE_URL}/companies/${companyId}`, companyData, {
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
            await axios.delete(`${this.API_BASE_URL}/companies/${companyId}`, {
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