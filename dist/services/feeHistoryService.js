"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeHistoryService = void 0;
exports.apiGet = apiGet;
exports.getHistoriesFromApi = getHistoriesFromApi;
const uuid_1 = require("uuid");
const storageService_1 = require("./storageService");
const api_service_1 = require("./api.service");
const axios_1 = __importDefault(require("axios"));
const STORAGE_KEY = 'fee_history';
class FeeHistoryService {
    constructor() {
        this.histories = [];
        this.loadHistories();
    }
    async loadHistories() {
        try {
            const data = await storageService_1.storageService.getData(STORAGE_KEY);
            this.histories = data || [];
        }
        catch (error) {
            console.error('載入繳費歷史記錄失敗:', error);
            this.histories = [];
        }
    }
    async getHistories(filter) {
        try {
            // 使用雲端 API 獲取資料
            const histories = await getHistoriesFromApi(filter);
            // 如果沒有 filter，直接回傳所有資料
            if (!filter)
                return histories;
            // 如果有 filter，進行本地篩選
            return histories.filter(history => {
                const matchStatus = !filter.status || history.status === filter.status;
                const matchMember = !filter.memberId || history.memberId === filter.memberId;
                const matchUser = !filter.userId || history.memberId === filter.userId;
                const matchDate = (!filter.startDate || history.date >= filter.startDate) &&
                    (!filter.endDate || history.date <= filter.endDate);
                return matchStatus && matchMember && matchUser && matchDate;
            });
        }
        catch (error) {
            console.error('從 API 獲取歷史記錄失敗:', error);
            // 如果 API 失敗，回退到 localStorage
            await this.loadHistories();
            if (!filter)
                return this.histories;
            return this.histories.filter(history => {
                const matchStatus = !filter.status || history.action.includes(filter.status);
                const matchMember = !filter.memberId || history.memberId === filter.memberId;
                const matchUser = !filter.userId || history.memberId === filter.userId;
                const matchDate = (!filter.startDate || history.date >= filter.startDate) &&
                    (!filter.endDate || history.date <= filter.endDate);
                return matchStatus && matchMember && matchUser && matchDate;
            });
        }
    }
    async addHistory(record) {
        await this.loadHistories();
        const newRecord = {
            ...record,
            id: (0, uuid_1.v4)()
        };
        this.histories.push(newRecord);
        await this.saveHistories();
        return newRecord;
    }
    async updateHistory(id, updates) {
        await this.loadHistories();
        const index = this.histories.findIndex(h => h.id === id);
        if (index === -1)
            return null;
        this.histories[index] = {
            ...this.histories[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await this.saveHistories();
        return this.histories[index];
    }
    async deleteHistory(id) {
        await this.loadHistories();
        const filteredHistories = this.histories.filter(h => h.id !== id);
        if (filteredHistories.length === this.histories.length) {
            return false;
        }
        this.histories = filteredHistories;
        await this.saveHistories();
        return true;
    }
    async exportToExcel(filter) {
        // 直接從雲端 API 取得資料
        const histories = await getHistoriesFromApi(filter);
        // 建立 CSV 內容
        const headers = [
            '會員編號',
            '會員姓名',
            '會員類型',
            '操作',
            '金額',
            '日期',
            '到期日',
            '繳費日期',
            '繳費方式',
            '狀態',
            '備註'
        ];
        const rows = histories.map(h => {
            var _a, _b, _c;
            return [
                h.memberId,
                h.memberName,
                h.memberType,
                h.action,
                (_c = (_b = (_a = h.amount) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : '',
                h.date,
                h.dueDate,
                h.paymentDate || '',
                h.paymentMethod || '',
                h.status,
                h.note
            ];
        });
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        // 添加 BOM 標記
        const BOM = '\uFEFF';
        const csvContentWithBOM = BOM + csvContent;
        return new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8' });
    }
    async saveHistories() {
        try {
            await storageService_1.storageService.updateData(STORAGE_KEY, this.histories);
        }
        catch (error) {
            console.error('儲存繳費歷史記錄失敗:', error);
            throw error;
        }
    }
    // 添加 updateRecord 方法
    async updateRecord(id, record) {
        return this.updateHistory(id, record);
    }
    // 添加 deleteRecord 方法
    async deleteRecord(id) {
        await this.loadHistories();
        const filteredHistories = this.histories.filter(h => h.id !== id);
        if (filteredHistories.length === this.histories.length) {
            return false;
        }
        this.histories = filteredHistories;
        await this.saveHistories();
        return true;
    }
}
exports.feeHistoryService = new FeeHistoryService();
// 將 PaymentStatus 轉換為 FeeHistory
const convertPaymentToHistory = (payment) => ({
    id: `${Date.now()}`,
    userId: payment.memberId,
    userName: payment.memberName,
    memberType: payment.memberType,
    amount: payment.amount,
    dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
    paymentDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : undefined,
    status: payment.status,
    paymentMethod: undefined,
    receiptNumber: undefined,
    note: payment.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentId: payment.id,
    memberName: payment.memberName,
    memberId: payment.memberId,
    action: payment.status,
    date: new Date().toISOString().split('T')[0]
});
// 獲取歷史記錄
const getHistories = async (filter) => {
    const histories = await storageService_1.storageService.getData('feeHistory') || [];
    return histories.filter((history) => {
        const matchStatus = !filter.status || history.action.includes(filter.status);
        const matchMember = !filter.memberId || history.memberId === filter.memberId;
        const matchUser = !filter.userId || history.memberId === filter.userId;
        const matchDate = (!filter.startDate || history.date >= filter.startDate) &&
            (!filter.endDate || history.date <= filter.endDate);
        return matchStatus && matchMember && matchUser && matchDate;
    });
};
// 新增歷史記錄
const addRecord = async (record) => {
    const histories = await storageService_1.storageService.getData('feeHistory') || [];
    const newRecord = {
        ...record,
        id: (0, uuid_1.v4)()
    };
    histories.push(newRecord);
    await storageService_1.storageService.updateData('feeHistory', histories);
    return newRecord;
};
// 更新歷史記錄
const updateRecord = async (id, record) => {
    const histories = await storageService_1.storageService.getData('feeHistory') || [];
    const index = histories.findIndex((h) => h.id === id);
    if (index === -1)
        return null;
    histories[index] = {
        ...histories[index],
        ...record,
        updatedAt: new Date().toISOString()
    };
    await storageService_1.storageService.updateData('feeHistory', histories);
    return histories[index];
};
// 刪除歷史記錄
const deleteRecord = async (id) => {
    const histories = await storageService_1.storageService.getData('feeHistory') || [];
    const filteredHistories = histories.filter((h) => h.id !== id);
    if (filteredHistories.length === histories.length) {
        return false;
    }
    await storageService_1.storageService.updateData('feeHistory', filteredHistories);
    return true;
};
// 匯出歷史記錄
const exportToExcel = async (filter) => {
    const histories = await getHistories(filter);
    // 建立 CSV 內容
    const headers = [
        '會員編號',
        '會員姓名',
        '會員類型',
        '操作',
        '金額',
        '日期',
        '到期日',
        '繳費日期',
        '繳費方式',
        '狀態',
        '備註'
    ];
    const rows = histories.map(h => [
        h.memberId,
        h.memberName,
        h.memberType,
        h.action,
        h.amount.toString(),
        h.date,
        h.dueDate,
        h.paymentDate || '',
        h.paymentMethod || '',
        h.status,
        h.note
    ]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    // 添加 BOM 標記
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;
    return new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8' });
};
// 取得 API_BASE_URL
function getApiBaseUrl() {
    // @ts-ignore
    return api_service_1.ApiService.API_BASE_URL || '';
}
// 取得 API 資料的工具
async function apiGet(url, params) {
    const token = localStorage.getItem('token');
    const baseURL = getApiBaseUrl();
    const response = await axios_1.default.get(baseURL + url, {
        params,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
}
async function getHistoriesFromApi(filter) {
    const params = { isHistoryPage: true };
    const data = await apiGet('/fees', params);
    return (data || []).map((item) => ({
        id: item.id,
        memberId: item.memberId,
        memberName: item.memberName,
        memberType: item.memberType,
        amount: item.amount,
        dueDate: item.dueDate,
        paymentDate: item.paidDate,
        paymentMethod: item.paymentMethod,
        status: item.status,
        note: item.note,
        action: item.status,
        date: item.paidDate || item.dueDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userId: item.memberId || '',
        userName: item.memberName || '',
        paymentId: item.id || ''
    }));
}
