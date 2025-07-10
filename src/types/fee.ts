export interface FeeSetting {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly' | '5year' | 'forever';
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface FeeRecord {
    id: string;
    userId: string;
    settingId: string;
    amount: number;
    status: 'pending' | 'paid';
    dueDate: Date;
    paidDate?: Date;
}

export interface PaymentRecord {
    id: string;
    feeId: string;
    memberId: string;
    memberName: string;
    year: number;
    amount: number;
    paymentDate: Date;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: Date;
    remarks?: string;
}

export interface ExpirationReminder {
    id: string;
    feeId: string;
    memberId: string;
    memberName: string;
    memberType: string;
    dueDate: Date;
    reminderDate: Date;
    expirationDate: Date;
    status: 'pending' | 'sent' | 'expired';
    daysRemaining: number;
    reminderSent: boolean;
}

export type PaymentStatus = '待收款' | '已收款' | '逾期' | '終止';
export type PaymentMethod = '轉帳' | 'Line Pay' | '現金' | '票據' | '其他';

export interface FeeHistory {
    id: string;
    memberId: string;
    memberName: string;
    memberType: string;
    userId: string;
    userName: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    date: string;
    action: string;
    paymentDate?: string;
    paymentMethod?: PaymentMethod;
    receiptNumber?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
    paymentId: string;
}

export interface FeeHistoryFilter {
    memberId?: string;
    userId?: string;
    status?: PaymentStatus | '';
    startDate?: string;
    endDate?: string;
}

export interface FeePaymentFilter {
    status: '' | PaymentStatus;
    memberType: string;
    search: string;
}

export interface PaymentStatusRecord {
    id: string;
    memberId: string;
    memberName: string;
    memberType: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    paidDate?: string;
    note?: string;
    feeSettingId?: string;
    paymentMethod?: PaymentMethod;
}

export type MemberType = '一般會員' | '商務會員' | '終身會員'; 