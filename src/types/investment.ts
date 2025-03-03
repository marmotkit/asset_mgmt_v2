// 投資類型
export type InvestmentType = 'movable' | 'immovable';  // 動產 | 不動產

// 投資狀態
export type InvestmentStatus =
    | 'active'      // 進行中
    | 'completed'   // 已完成
    | 'terminated'  // 已終止
    | 'pending';    // 審核中

// 收款狀態
export type PaymentStatus = 'paid' | 'pending' | 'overdue';  // 已收 | 未收 | 催收

// 收款方式
export type PaymentMethod = 'transfer' | 'cash' | 'linepay' | 'other';

// 分潤類型
export type ProfitSharingType = 'percentage' | 'fixed' | 'other';

// 分潤設定介面
export interface ProfitSharingSettings {
    type: ProfitSharingType;
    value: number;              // 百分比或固定金額
    description?: string;       // 其他類型的說明
    minimumAmount?: number;     // 最低分潤金額
    maximumAmount?: number;     // 最高分潤金額
}

// 合約檔案介面
export interface ContractFile {
    id: string;
    filename: string;
    uploadDate: Date;
    fileSize: number;
    fileType: string;
    url: string;
}

// 租金收款記錄
export interface RentalPayment {
    id: string;
    dueDate: Date;        // 應收日期
    amount: number;       // 應收金額
    status: PaymentStatus; // 收款狀態
    paidDate?: Date;      // 實際收款日期
    paymentMethod?: PaymentMethod; // 收款方式
    notes?: string;       // 備註
}

// 基本投資項目介面
interface BaseInvestment {
    id: string;
    companyId: string;          // 關聯的公司 ID
    name: string;               // 投資項目名稱
    description: string;        // 項目描述
    amount: number;             // 投資金額
    startDate: Date;           // 開始日期
    endDate?: Date;            // 結束日期
    status: InvestmentStatus;   // 狀態
    notes?: string;            // 備註
    createdAt: Date;
    updatedAt: Date;
    contract?: ContractFile;    // 新增合約檔案欄位
    monthlyRental: number;     // 每月租金
    rentalPayments: RentalPayment[]; // 租金收款記錄
    profitSharing?: ProfitSharingSettings; // 新增分潤設定
}

// 動產投資
export interface MovableInvestment extends BaseInvestment {
    type: 'movable';
    assetType: string;         // 動產類型
    serialNumber?: string;     // 序號
    manufacturer?: string;     // 製造商
    purchaseDate: Date;       // 購入日期
}

// 不動產投資
export interface ImmovableInvestment extends BaseInvestment {
    type: 'immovable';
    location: string;          // 位置
    area: number;             // 面積
    propertyType: string;     // 不動產類型
    registrationNumber?: string; // 登記號碼
}

// 通用投資型別
export type Investment = MovableInvestment | ImmovableInvestment; 