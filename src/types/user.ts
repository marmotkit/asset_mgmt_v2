export type UserRole = 'admin' | 'normal' | 'business' | 'lifetime';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserPreference {
  key: string;
  value: string | number | boolean;
}

export interface InvestmentPreferences {
  riskTolerance: string;
  investmentPeriod: string;
  preferences: string[];
}

export interface UserPreferences {
  id: string;
  userId: string;
  investmentPreferences: InvestmentPreferences;
  riskTolerance: string;
  investmentPeriod: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;          // UUID
  memberNo: string;    // 會員編號 (C001, V001, B001 etc.)
  username: string;    // 帳號
  name: string;        // 使用單一的 name 欄位
  email: string;       // 電子郵件
  role: UserRole;      // 會員等級
  status: UserStatus;  // 狀態
  companyId?: string;    // 新增：關聯的公司 ID
  firstName?: string;
  lastName?: string;
  phone?: string;
  contactInfo?: string;
  preferences: UserPreference[];
  isFirstLogin: boolean; // 是否首次登入
  createdAt: string;     // 建立時間
  updatedAt: string;     // 更新時間
  password?: string;   // 可選欄位，僅用於創建/更新時
  plainPassword?: string; // 明文密碼（僅用於管理員查詢）
}

export interface InvestmentPreference {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'type' | 'period';
  order: number;
}

export const USER_ROLE_PREFIX: Record<UserRole, string> = {
  normal: 'C',
  business: 'B',
  lifetime: 'L',
  admin: 'A'
}; 