import { FeeSettings, PaymentRecord, ExpirationReminder } from '../types/fee';
import { mockFeeSettings, mockPaymentRecords, mockExpirationReminders } from '../mocks/feeData';

// 模擬 API 延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const feeService = {
    // 收費設定相關
    getFeeSettings: async (): Promise<FeeSettings[]> => {
        await delay(500);
        return mockFeeSettings;
    },

    createFeeSetting: async (feeSetting: Omit<FeeSettings, 'id'>): Promise<FeeSettings | null> => {
        await delay(500);
        const newSetting: FeeSettings = {
            ...feeSetting,
            id: Math.random().toString(36).substr(2, 9),
            status: '有效'
        };
        mockFeeSettings.push(newSetting);
        return newSetting;
    },

    updateFeeSetting: async (id: string, feeSetting: Partial<FeeSettings>): Promise<FeeSettings | null> => {
        await delay(500);
        const index = mockFeeSettings.findIndex(setting => setting.id === id);
        if (index === -1) return null;
        mockFeeSettings[index] = { ...mockFeeSettings[index], ...feeSetting };
        return mockFeeSettings[index];
    },

    deleteFeeSetting: async (id: string): Promise<boolean> => {
        await delay(500);
        const index = mockFeeSettings.findIndex(setting => setting.id === id);
        if (index === -1) return false;
        mockFeeSettings.splice(index, 1);
        return true;
    },

    // 收款記錄相關
    getPaymentRecords: async (): Promise<PaymentRecord[]> => {
        await delay(500);
        return mockPaymentRecords;
    },

    createPaymentRecord: async (record: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord | null> => {
        await delay(500);
        const newRecord: PaymentRecord = {
            ...record,
            id: Math.random().toString(36).substr(2, 9)
        };
        mockPaymentRecords.push(newRecord);
        return newRecord;
    },

    updatePaymentRecord: async (id: string, record: Partial<PaymentRecord>): Promise<PaymentRecord | null> => {
        await delay(500);
        const index = mockPaymentRecords.findIndex(r => r.id === id);
        if (index === -1) return null;
        mockPaymentRecords[index] = { ...mockPaymentRecords[index], ...record };
        return mockPaymentRecords[index];
    },

    // 到期提醒相關
    getExpirationReminders: async (): Promise<ExpirationReminder[]> => {
        await delay(500);
        return mockExpirationReminders;
    },

    updateReminderStatus: async (id: string, status: Partial<ExpirationReminder>): Promise<ExpirationReminder | null> => {
        await delay(500);
        const index = mockExpirationReminders.findIndex(r => r.id === id);
        if (index === -1) return null;
        mockExpirationReminders[index] = { ...mockExpirationReminders[index], ...status };
        return mockExpirationReminders[index];
    },

    // 批量操作
    generatePaymentRecords: async (year: number): Promise<PaymentRecord[]> => {
        await delay(500);
        const newRecords = mockFeeSettings.map(setting => ({
            id: Math.random().toString(36).substr(2, 9),
            memberId: setting.memberId,
            memberName: setting.memberName,
            year,
            amount: setting.annualFee,
            paymentDate: '',
            dueDate: `${year}-12-31`,
            status: '未付款' as const
        }));
        mockPaymentRecords.push(...newRecords);
        return newRecords;
    },

    sendReminders: async (reminderIds: string[]): Promise<boolean> => {
        await delay(500);
        reminderIds.forEach(id => {
            const reminder = mockExpirationReminders.find(r => r.id === id);
            if (reminder) {
                reminder.reminderSent = true;
                reminder.lastReminderDate = new Date().toISOString().split('T')[0];
            }
        });
        return true;
    },
}; 