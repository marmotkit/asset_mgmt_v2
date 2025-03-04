export type UserRole = 'admin' | 'normal' | 'lifetime' | 'business';

export type UserStatus = 'active' | 'disabled' | 'pending';

export interface UserPreference {
  id: string;
  name: string;
  description?: string;
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
  preferences: UserPreferences[];
  isFirstLogin: boolean; // 是否首次登入
  createdAt: string;     // 建立時間
  updatedAt: string;     // 更新時間
  password?: string;   // 可選欄位，僅用於創建/更新時
}

export interface InvestmentPreference {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'type' | 'period';
  order: number;
}

export interface UserPreferences {
  id: string;
  userId: string;
  investmentPreferences: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentPeriod: 'short' | 'medium' | 'long';
  createdAt: string;
  updatedAt: string;
}

export const USER_ROLE_PREFIX: Record<UserRole, string> = {
  normal: 'C',
  lifetime: 'V',
  business: 'B',
  admin: 'A'
}; 