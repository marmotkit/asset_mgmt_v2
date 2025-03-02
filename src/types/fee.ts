export interface FeeSetting {
    id: string;
    name: string;
    amount: number;
    frequency: 'yearly' | 'monthly';
    description: string;
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