import { UserRole } from '../types/user';

const USER_ROLE_PREFIX: Record<UserRole, string> = {
  normal: 'C',
  lifetime: 'V',
  business: 'B',
  admin: 'A'
};

export const generateMemberNo = async (
  role: UserRole, 
  existingNumbers: string[]
): Promise<string> => {
  const prefix = USER_ROLE_PREFIX[role];
  
  // 過濾出相同前綴的會員編號
  const sameTypeNumbers = existingNumbers
    .filter(no => no.startsWith(prefix))
    .map(no => parseInt(no.substring(1), 10))
    .filter(no => !isNaN(no));

  // 如果沒有相同類型的會員，從 1 開始
  if (sameTypeNumbers.length === 0) {
    return `${prefix}001`;
  }

  // 找出最大的序號
  const maxNumber = Math.max(...sameTypeNumbers);
  
  // 生成新的序號（補零到3位數）
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// 驗證會員編號格式
export const validateMemberNo = (memberNo: string): boolean => {
  const pattern = /^[CVBA]\d{3}$/;
  return pattern.test(memberNo);
};

// 從會員編號獲取會員類型
export const getRoleFromMemberNo = (memberNo: string): UserRole | null => {
  const prefix = memberNo.charAt(0);
  const roleMap: Record<string, UserRole> = {
    'C': 'normal',
    'V': 'lifetime',
    'B': 'business',
    'A': 'admin'
  };
  return roleMap[prefix] || null;
}; 