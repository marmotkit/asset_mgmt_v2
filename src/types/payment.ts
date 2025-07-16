// 收款狀態
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'received' | 'delayed';

// 收款方式
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'transfer' | 'other';

// 交易類型
export type TransactionType = 'income' | 'expense';

// 帳務記錄類型
export interface AccountRecord {
    id: string;
    date: string;
    amount: number;
    type: TransactionType;
    category: string;
    paymentMethod: PaymentMethod;
    description: string;
    relatedParty?: string;
    invoiceNumber?: string;
    createdAt: string;
    updatedAt: string;
}

// 應收帳款類型
export interface AccountReceivable {
    id: string;
    customer_id: string;
    customer_name: string;
    invoice_number?: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    payment_date?: string;
    payment_amount?: number;
    remaining_amount: number;
    description?: string;
    created_at: string;
    updated_at: string;
    // 備用屬性，保持向後相容性
    clientName?: string;
    date?: string;
    paidAmount?: number;
}

// 應付帳款類型
export interface AccountPayable {
    id: string;
    supplier_id: string;
    supplier_name: string;
    invoice_number?: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    payment_date?: string;
    payment_amount?: number;
    remaining_amount: number;
    description?: string;
    created_at: string;
    updated_at: string;
    // 備用屬性，保持向後相容性
    vendorName?: string;
    date?: string;
    paidAmount?: number;
}

// 月結記錄類型
export interface MonthlyClosing {
    id: string;
    year: number;
    month: number;
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    status: 'pending' | 'finalized';
    closingDate?: string;
    remark?: string;
    createdAt: string;
    updatedAt: string;
}

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