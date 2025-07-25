// 為 TypeScript 添加全局 window.APP_CONFIG 類型定義
declare global {
    interface Window {
        APP_CONFIG?: {
            API_BASE_URL?: string;
        };
        ENV?: {
            API_URL?: string;
        };
    }
}

// 獲取 API 基礎 URL
const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return '/api';

    // 優先使用 APP_CONFIG 配置
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
        return window.APP_CONFIG.API_BASE_URL;
    }

    // 備用配置
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
};

// 獲取認證 token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const FeeApi = {
    async createFees(fees: any[]) {
        const res = await fetch(`${getApiBaseUrl()}/fees`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(fees),
        });
        if (!res.ok) throw new Error('建立失敗');
        return res.json();
    },
    async getFees(params: any) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${getApiBaseUrl()}/fees?${query}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('獲取費用資料失敗');
        return res.json();
    },
    async updateFee(id: string, data: any) {
        const res = await fetch(`${getApiBaseUrl()}/fees/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('更新費用資料失敗');
        return res.json();
    },
    async deleteFee(id: string) {
        const res = await fetch(`${getApiBaseUrl()}/fees/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('刪除費用資料失敗');
        return res.json();
    },
}; 