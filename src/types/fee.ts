export interface FeeSettings {
    id: string;
    memberId: string;
    memberName: string;
    memberType: '一般會員' | '商務會員' | '終身會員';
    annualFee: number;
    startDate: string;
    endDate: string;
    status: '有效' | '已過期' | '即將到期';
}

export interface PaymentRecord {
    id: string;
    memberId: string;
    memberName: string;
    year: number;
    amount: number;
    paymentDate: string;
    dueDate: string;
    status: '已付款' | '未付款' | '逾期';
    remarks?: string;
}

export interface ExpirationReminder {
    id: string;
    memberId: string;
    memberName: string;
    memberType: string;
    expirationDate: string;
    daysRemaining: number;
    status: '正常' | '即將到期' | '已過期';
    reminderSent: boolean;
    lastReminderDate?: string;
}

export const DEFAULT_FEE_SETTINGS = {
    '一般會員': 30000,
    '商務會員': 300000,
    '終身會員': 3000000,
}; 