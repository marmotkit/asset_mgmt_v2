export type IndustryType =
    | 'manufacturing'
    | 'technology'
    | 'finance'
    | 'retail'
    | 'service'
    | 'other';

export interface ContactInfo {
    name: string;
    phone: string;
    email: string;
}

export interface Company {
    id: string;
    companyNo: string;    // 公司編號 (A001, A002, etc.)
    taxId: string;        // 統一編號
    name: string;
    nameEn?: string;
    industry: IndustryType;
    address: string;
    contact: ContactInfo;
    fax?: string;
    note?: string;        // 新增：備註欄位
    createdAt: string;
    updatedAt: string;
}