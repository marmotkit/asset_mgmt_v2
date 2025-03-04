import { v4 as uuidv4 } from 'uuid';
import { FeeHistory, FeeHistoryFilter } from '../types/fee';
import { storageService } from './storageService';

const STORAGE_KEY = 'fee_history';

class FeeHistoryService {
    private histories: FeeHistory[] = [];

    constructor() {
        this.loadHistories();
    }

    private async loadHistories(): Promise<void> {
        try {
            const data = await storageService.getData<FeeHistory[]>(STORAGE_KEY);
            this.histories = data || [];
        } catch (error) {
            console.error('載入繳費歷史記錄失敗:', error);
            this.histories = [];
        }
    }

    async getHistories(filter?: FeeHistoryFilter): Promise<FeeHistory[]> {
        await this.loadHistories();
        if (!filter) return this.histories;

        return this.histories.filter(history => {
            const matchStatus = !filter.status || history.action.includes(filter.status);
            const matchMember = !filter.memberId || history.memberId === filter.memberId;
            const matchUser = !filter.userId || history.memberId === filter.userId;
            const matchDate = (!filter.startDate || history.date >= filter.startDate) &&
                (!filter.endDate || history.date <= filter.endDate);

            return matchStatus && matchMember && matchUser && matchDate;
        });
    }

    async addHistory(record: Omit<FeeHistory, 'id'>): Promise<FeeHistory> {
        await this.loadHistories();
        const newRecord: FeeHistory = {
            ...record,
            id: uuidv4()
        };
        this.histories.push(newRecord);
        await this.saveHistories();
        return newRecord;
    }

    async updateHistory(id: string, updates: Partial<FeeHistory>): Promise<FeeHistory | null> {
        await this.loadHistories();
        const index = this.histories.findIndex(h => h.id === id);
        if (index === -1) return null;

        this.histories[index] = {
            ...this.histories[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await this.saveHistories();
        return this.histories[index];
    }

    async deleteHistory(id: string): Promise<boolean> {
        await this.loadHistories();
        const filteredHistories = this.histories.filter(h => h.id !== id);
        if (filteredHistories.length === this.histories.length) {
            return false;
        }
        this.histories = filteredHistories;
        await this.saveHistories();
        return true;
    }

    async exportToExcel(filter?: FeeHistoryFilter): Promise<Blob> {
        const histories = await this.getHistories(filter);

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
            '收據號碼',
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
            h.receiptNumber || '',
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
    }

    private async saveHistories(): Promise<void> {
        try {
            await storageService.updateData(STORAGE_KEY, this.histories);
        } catch (error) {
            console.error('儲存繳費歷史記錄失敗:', error);
            throw error;
        }
    }

    // 添加 updateRecord 方法
    async updateRecord(id: string, record: Partial<FeeHistory>): Promise<FeeHistory | null> {
        return this.updateHistory(id, record);
    }

    // 添加 deleteRecord 方法
    async deleteRecord(id: string): Promise<boolean> {
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

export const feeHistoryService = new FeeHistoryService();

// 將 PaymentStatus 轉換為 FeeHistory
const convertPaymentToHistory = (payment: any): FeeHistory => ({
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
const getHistories = async (filter: FeeHistoryFilter): Promise<FeeHistory[]> => {
    const histories = await storageService.getData<FeeHistory[]>('feeHistory') || [];

    return histories.filter((history: FeeHistory) => {
        const matchStatus = !filter.status || history.action.includes(filter.status);
        const matchMember = !filter.memberId || history.memberId === filter.memberId;
        const matchUser = !filter.userId || history.memberId === filter.userId;
        const matchDate = (!filter.startDate || history.date >= filter.startDate) &&
            (!filter.endDate || history.date <= filter.endDate);

        return matchStatus && matchMember && matchUser && matchDate;
    });
};

// 新增歷史記錄
const addRecord = async (record: Omit<FeeHistory, 'id'>): Promise<FeeHistory> => {
    const histories = await storageService.getData<FeeHistory[]>('feeHistory') || [];
    const newRecord: FeeHistory = {
        ...record,
        id: uuidv4()
    };

    histories.push(newRecord);
    await storageService.updateData('feeHistory', histories);
    return newRecord;
};

// 更新歷史記錄
const updateRecord = async (id: string, record: Partial<FeeHistory>): Promise<FeeHistory | null> => {
    const histories = await storageService.getData<FeeHistory[]>('feeHistory') || [];
    const index = histories.findIndex((h: FeeHistory) => h.id === id);
    if (index === -1) return null;

    histories[index] = {
        ...histories[index],
        ...record,
        updatedAt: new Date().toISOString()
    };

    await storageService.updateData('feeHistory', histories);
    return histories[index];
};

// 刪除歷史記錄
const deleteRecord = async (id: string): Promise<boolean> => {
    const histories = await storageService.getData<FeeHistory[]>('feeHistory') || [];
    const filteredHistories = histories.filter((h: FeeHistory) => h.id !== id);

    if (filteredHistories.length === histories.length) {
        return false;
    }

    await storageService.updateData('feeHistory', filteredHistories);
    return true;
};

// 匯出歷史記錄
const exportToExcel = async (filter: FeeHistoryFilter): Promise<Blob> => {
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
        '收據號碼',
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
        h.receiptNumber || '',
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