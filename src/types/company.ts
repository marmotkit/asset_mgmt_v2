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
    name: string;
    nameEn?: string;
    companyNo: string;
    industry: IndustryType;
    contact: ContactInfo;
    createdAt: string;
    updatedAt: string;
}