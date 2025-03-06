// 租賃標準設定
export interface RentalStandard {
    id: string;
    investmentId: string;  // 關聯的投資項目ID
    monthlyRent: number;   // 月租金
    startDate: string;     // 生效日期
    endDate?: string;      // 結束日期（可選）
    note?: string;         // 備註
    createdAt: string;
    updatedAt: string;
}

// 分潤標準設定
export enum ProfitSharingType {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount',
    OTHER = 'other'
}

export interface ProfitSharingStandard {
    id: string;
    investmentId: string;         // 關聯的投資項目ID
    type: ProfitSharingType;      // 分潤方式
    value: number;                // 分潤值（百分比或固定金額）
    startDate: string;            // 生效日期
    endDate?: string;            // 結束日期（可選）
    minAmount?: number;
    maxAmount?: number;
    note?: string;               // 備註
    createdAt: string;
    updatedAt: string;
}

// 租金收款項目
export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    OVERDUE = 'overdue'
}

export enum PaymentMethod {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    LINE_PAY = 'line_pay',
    CHECK = 'check',
    OTHER = 'other'
}

export interface RentalPayment {
    id: string;
    investmentId: string;       // 關聯的投資項目ID
    year: number;               // 年度
    month: number;              // 月份
    amount: number;             // 租金金額
    startDate: string;
    endDate: string;
    status: PaymentStatus;      // 收款狀態
    paymentMethod?: PaymentMethod; // 收款方式
    paymentDate?: string;       // 收款日期
    note?: string;              // 備註
    createdAt: string;
    updatedAt: string;
}

// 會員分潤項目
export interface MemberProfit {
    id: string;
    investmentId: string;       // 關聯的投資項目ID
    memberId: string;           // 會員ID
    year: number;               // 年度
    month: number;              // 月份
    amount: number;             // 分潤金額
    status: PaymentStatus;      // 支付狀態
    paymentMethod?: PaymentMethod; // 支付方式
    paymentDate?: string;       // 支付日期
    note?: string;              // 備註
    createdAt: string;
    updatedAt: string;
} 