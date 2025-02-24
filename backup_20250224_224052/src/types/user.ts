export type UserRole = 'admin' | 'normal' | 'lifetime' | 'business';

export type UserStatus = 'active' | 'pending' | 'disabled';

export interface UserPreference {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  memberNo: string;
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  preferences: any[];
  isFirstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentPreference {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'type' | 'period';
  order: number;
}

export interface UserPreferences {
  userId: string;
  preferences: string[]; // InvestmentPreference IDs
  riskTolerance: 'low' | 'medium' | 'high';
  investmentPeriod: 'short' | 'medium' | 'long';
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface UserFormData extends Partial<User> {
  password?: string;
  firstName?: string;
  lastName?: string;
}

export const USER_ROLE_PREFIX: Record<UserRole, string> = {
  normal: 'C',
  lifetime: 'V',
  business: 'B',
  admin: 'A'
}; 