import { UserRole } from '../types/user';

export const USER_ROLE_PREFIX: Record<UserRole, string> = {
  normal: 'C',
  business: 'B',
  lifetime: 'L',
  admin: 'A'
};

export const generateMemberNo = async (role: UserRole, currentCount: number): Promise<string> => {
  const prefix = USER_ROLE_PREFIX[role];
  const paddedCount = String(currentCount + 1).padStart(3, '0');
  return `${prefix}${paddedCount}`;
}; 