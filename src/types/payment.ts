// 收款狀態
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'received' | 'delayed';

// 收款方式
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'transfer' | 'other';

export interface RentalPayment {
    id: string;
    leaseItemId: string;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    notes?: string;
    createdAt: string;
    updatedAt: string;
} 