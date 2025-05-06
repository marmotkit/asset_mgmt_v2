"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
// 初始資料
const initialData = {
    documents: [],
    feeHistory: [],
    feeSettings: [],
    paymentStatuses: []
};
// Storage Keys
const STORAGE_KEY = 'asset_management_data';
const OLD_STORAGE_KEYS = {
    members: 'members',
    companies: 'companies',
    investments: 'investments',
    feePayments: 'fee_payments',
    feeHistory: 'fee_history',
    feeSettings: 'fee_settings'
};
// 從舊的儲存位置遷移資料
const migrateOldData = () => {
    const migratedData = { ...initialData };
    let hasOldData = false;
    // 檢查並遷移每個模組的資料
    Object.entries(OLD_STORAGE_KEYS).forEach(([key, storageKey]) => {
        const oldData = localStorage.getItem(storageKey);
        if (oldData) {
            try {
                const parsedData = JSON.parse(oldData);
                if (Array.isArray(parsedData)) {
                    migratedData[key] = parsedData;
                    hasOldData = true;
                }
            }
            catch (e) {
                console.error(`無法解析舊的 ${key} 資料:`, e);
            }
        }
    });
    // 如果沒有找到任何舊資料，使用預設的測試資料
    if (!hasOldData) {
        return {
            documents: [
                {
                    id: 'A001',
                    name: '系統管理員',
                    type: '一般會員',
                    email: 'admin@example.com',
                    phone: '0912345678',
                    status: 'active'
                },
                {
                    id: 'V001',
                    name: '梁坤榮',
                    type: '商務會員',
                    email: 'liang@example.com',
                    phone: '0923456789',
                    status: 'active'
                }
            ]
        };
    }
    return migratedData;
};
// 檢查並初始化資料
const initializeStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        // 遷移舊資料
        const migratedData = migrateOldData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        // 清除舊的儲存資料
        Object.values(OLD_STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return migratedData;
    }
    return JSON.parse(stored);
};
// 獲取特定類型的資料
const getData = (key) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return [];
    }
    const data = JSON.parse(stored);
    return data[key] || [];
};
// 更新特定類型的資料
const updateData = (key, newData) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data;
    if (!stored) {
        data = { ...initialData };
    }
    else {
        data = JSON.parse(stored);
    }
    data[key] = newData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
// 重置所有資料到初始狀態
const resetStorage = () => {
    localStorage.clear();
    return initializeStorage();
};
class StorageService {
    constructor() {
        this.storage = initialData;
    }
    async getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('讀取資料失敗:', error);
            return null;
        }
    }
    async updateData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        }
        catch (error) {
            console.error('更新資料失敗:', error);
            throw error;
        }
    }
    async clearData(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error('清除資料失敗:', error);
            throw error;
        }
    }
    async initialize() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            }
        }
        catch (error) {
            console.error('初始化儲存空間失敗:', error);
            throw error;
        }
    }
}
exports.storageService = new StorageService();
// 初始化儲存空間
exports.storageService.initialize().catch(error => {
    console.error('初始化儲存空間失敗:', error);
});
