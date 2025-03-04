export type IndustryType =
    | '科技業'
    | '金融業'
    | '製造業'
    | '服務業'
    | '零售業'
    | '營建業'
    | '運輸業'
    | '其他';

export interface Contact {
    name: string;      // 聯絡人姓名
    phone: string;     // 電話
    fax?: string;      // 傳真
    email: string;     // 電子郵件
}

export interface Company {
    id: string;           // UUID
    companyNo: string;    // 公司編號
    name: string;         // 公司名稱
    nameEn?: string;      // 英文名稱
    industry?: IndustryType; // 產業類型
    contact: Contact;     // 聯絡資訊
    notes?: string;       // 備註
    status: string;       // 公司狀態
    createdAt: string;    // 建立時間
    updatedAt: string;    // 更新時間
}