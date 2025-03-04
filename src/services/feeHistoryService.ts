import { v4 as uuidv4 } from 'uuid';
import { FeeHistory, FeeHistoryFilter } from '../types/fee';
import { storageService } from './storageService';

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
    const histories = await Promise.resolve(storageService.getData('feeHistory'));

    return histories.filter(history => {
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
    const histories = await Promise.resolve(storageService.getData('feeHistory'));
    const newRecord: FeeHistory = {
        ...record,
        id: uuidv4()
    };

    histories.push(newRecord);
    storageService.updateData('feeHistory', histories);
    return newRecord;
};

// 更新歷史記錄
const updateRecord = async (id: string, record: Partial<FeeHistory>): Promise<FeeHistory | null> => {
    const histories = await Promise.resolve(storageService.getData('feeHistory'));
    const index = histories.findIndex(h => h.id === id);
    if (index === -1) return null;

    histories[index] = {
        ...histories[index],
        ...record,
        updatedAt: new Date().toISOString()
    };

    storageService.updateData('feeHistory', histories);
    return histories[index];
};

// 刪除歷史記錄
const deleteRecord = async (id: string): Promise<boolean> => {
    const histories = await Promise.resolve(storageService.getData('feeHistory'));
    const filteredHistories = histories.filter(h => h.id !== id);

    if (filteredHistories.length === histories.length) {
        return false;
    }

    storageService.updateData('feeHistory', filteredHistories);
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

export const feeHistoryService = {
    getHistories,
    addRecord,
    updateRecord,
    deleteRecord,
    exportToExcel
}; 