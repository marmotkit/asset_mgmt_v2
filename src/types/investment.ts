import { LeaseItem, LeaseStatus, TenantInfo, ProfitSharing, ProfitSharingType } from './lease';
import { RentalPayment, PaymentStatus, PaymentMethod } from './payment';

// 投資類型
export type InvestmentType = 'movable' | 'immovable';  // 動產 | 不動產

// 投資狀態
export type InvestmentStatus = 'active' | 'sold' | 'pending' | 'completed' | 'terminated';

// 基本投資項目介面
export interface Investment {
    id: string;
    companyId: string;
    name: string;
    type: InvestmentType;
    description?: string;
    amount: number;
    startDate: string;
    endDate?: string;
    status: InvestmentStatus;
    leaseItems: LeaseItem[];
    createdAt: string;
    updatedAt: string;
}

// 動產投資
export interface MovableInvestment extends Investment {
    type: 'movable';
    assetType: string;
    serialNumber: string;
    manufacturer: string;
}

// 不動產投資
export interface ImmovableInvestment extends Investment {
    type: 'immovable';
    location: string;
    area: number;
    propertyType: string;
    registrationNumber: string;
}

// 通用投資型別
export type CommonInvestment = MovableInvestment | ImmovableInvestment;

// 投資表單資料
export interface InvestmentFormData {
    id?: string;
    companyId?: string;
    type?: InvestmentType;
    name?: string;
    description?: string;
    amount?: number;
    startDate?: string;
    endDate?: string;
    status?: InvestmentStatus;
    // 動產特有欄位
    assetType?: string;
    serialNumber?: string;
    manufacturer?: string;
    // 不動產特有欄位
    location?: string;
    area?: number;
    propertyType?: string;
    registrationNumber?: string;
    // 其他欄位
    leaseItems?: LeaseItem[];
    createdAt?: string;
    updatedAt?: string;
}

// 合約檔案
export interface ContractFile {
    id: string;
    investmentId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: string;
    url: string;
}

export type { LeaseItem, RentalPayment };
export type { LeaseStatus, TenantInfo, ProfitSharing, ProfitSharingType, PaymentStatus, PaymentMethod };