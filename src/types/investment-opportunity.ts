// 投資標的類型定義
export interface InvestmentOpportunity {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    short_description?: string;
    investment_amount: number;
    min_investment?: number;
    max_investment?: number;
    investment_type: 'lease' | 'equity' | 'debt' | 'real_estate' | 'other';
    location?: string;
    industry?: string;
    risk_level: 'low' | 'medium' | 'high';
    expected_return?: number;
    investment_period?: number; // 月數
    status: 'preview' | 'active' | 'hidden' | 'closed';
    featured: boolean;
    sort_order: number;
    view_count: number;
    inquiry_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    closed_at?: string;
    // 關聯資料
    images?: InvestmentImage[];
    inquiries?: InvestmentInquiry[];
}

export interface CreateInvestmentOpportunity {
    title: string;
    subtitle?: string;
    description: string;
    short_description?: string;
    investment_amount: number;
    min_investment?: number;
    max_investment?: number;
    investment_type: 'lease' | 'equity' | 'debt' | 'real_estate' | 'other';
    location?: string;
    industry?: string;
    risk_level: 'low' | 'medium' | 'high';
    expected_return?: number;
    investment_period?: number;
    status: 'preview' | 'active' | 'hidden' | 'closed';
    featured?: boolean;
    sort_order?: number;
    images?: UploadImage[];
}

export interface UpdateInvestmentOpportunity {
    title?: string;
    subtitle?: string;
    description?: string;
    short_description?: string;
    investment_amount?: number;
    min_investment?: number;
    max_investment?: number;
    investment_type?: 'lease' | 'equity' | 'debt' | 'real_estate' | 'other';
    location?: string;
    industry?: string;
    risk_level?: 'low' | 'medium' | 'high';
    expected_return?: number;
    investment_period?: number;
    status?: 'preview' | 'active' | 'hidden' | 'closed';
    featured?: boolean;
    sort_order?: number;
    images?: UploadImage[];
}

// 投資標的圖片
export interface InvestmentImage {
    id: string;
    investment_id: string;
    image_url: string;
    image_type: 'main' | 'gallery' | 'document';
    sort_order: number;
    created_at: string;
}

export interface CreateInvestmentImage {
    investment_id: string;
    image_url: string;
    image_type: 'main' | 'gallery' | 'document';
    sort_order?: number;
}

// 洽詢表
export interface InvestmentInquiry {
    id: string;
    investment_id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    investment_amount?: number;
    message?: string;
    status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'closed';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    // 關聯資料
    investment?: InvestmentOpportunity;
}

export interface CreateInvestmentInquiry {
    investment_id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    investment_amount?: number;
    message?: string;
}

export interface UpdateInvestmentInquiry {
    status?: 'new' | 'contacted' | 'interested' | 'not_interested' | 'closed';
    admin_notes?: string;
}

// 篩選條件
export interface InvestmentFilter {
    status?: 'preview' | 'active' | 'hidden' | 'closed';
    investment_type?: 'lease' | 'equity' | 'debt' | 'real_estate' | 'other';
    risk_level?: 'low' | 'medium' | 'high';
    min_amount?: number;
    max_amount?: number;
    location?: string;
    industry?: string;
    featured?: boolean;
    search?: string;
}

// 排序選項
export type InvestmentSortBy = 'created_at' | 'investment_amount' | 'expected_return' | 'view_count' | 'sort_order';
export type InvestmentSortOrder = 'asc' | 'desc';

// 簡化的圖片類型，用於上傳時（還沒有 investment_id）
export interface UploadImage {
    image_url: string;
    image_type: 'main' | 'gallery' | 'document';
    sort_order: number;
} 