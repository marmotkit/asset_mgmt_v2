export type IndustryType =
    | '科技業'
    | '金融業'
    | '製造業'
    | '服務業'
    | '零售業'
    | '營建業'
    | '運輸業'
    | '其他';

export interface Company {
    id: string;           // UUID
    companyNo: string;    // 公司編號 (A001, A002...)
    name: string;         // 公司名稱
    nameEn?: string;      // 英文簡稱
    industry?: IndustryType; // 產業類別
    contact: {            // 聯絡資訊
        name: string;       // 聯絡人
        phone: string;      // 聯絡電話
        fax?: string;       // 傳真電話
        email: string;      // 電子郵件
    };
    notes?: string;       // 新增備註欄位
    createdAt: Date;      // 建立時間
    updatedAt: Date;      // 更新時間
} 