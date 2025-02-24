import { UserRole } from '../types/user';

const USER_ROLE_PREFIX: Record<UserRole, string> = {
  admin: 'A',
  normal: 'C',
  lifetime: 'V',
  business: 'B'
};

export const generateMemberNo = async (
  role: UserRole,
  existingNumbers: string[]
): Promise<string> => {
  const prefix = USER_ROLE_PREFIX[role];

  // 找出相同前綴的最大編號
  const sameTypeNumbers = existingNumbers
    .filter(no => no.startsWith(prefix))
    .map(no => parseInt(no.substring(1), 10))
    .filter(no => !isNaN(no));

  // 如果沒有相同類型的編號，從 1 開始
  const maxNumber = sameTypeNumbers.length > 0
    ? Math.max(...sameTypeNumbers)
    : 0;

  // 生成新編號
  const newNumber = maxNumber + 1;

  // 補零到三位數
  const numberPart = newNumber.toString().padStart(3, '0');

  return `${prefix}${numberPart}`;
}; 