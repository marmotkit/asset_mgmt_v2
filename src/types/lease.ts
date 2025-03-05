import { RentalPayment } from './payment';

// 租賃狀態
export type LeaseStatus = 'active' | 'expired' | 'terminated';

// 承租人信息
export interface TenantInfo {
    name: string;
    contact: string;
    phone: string;
    email: string;
}

// 分潤類型
export type ProfitSharingType = 'monthly_fixed' | 'yearly_fixed' | 'percentage';

// 分潤設定
export interface ProfitSharing {
    type: ProfitSharingType;
    value: number;
    description?: string;
    minimumAmount?: number;
    maximumAmount?: number;
}

export interface LeaseItem {
    id: string;
    investmentId: string;
    name: string;
    description?: string;
    tenantInfo: TenantInfo;
    startDate: string;
    endDate: string;
    status: LeaseStatus;
    rentalAmount: number;
    rentalPayments: RentalPayment[];
    profitSharing?: ProfitSharing;
    createdAt: string;
    updatedAt: string;
} 