import { UserRole, USER_ROLE_PREFIX } from '../types/user';

export const generateMemberNo = async (role: UserRole, existingNumbers: string[]): Promise<string> => {
  const prefix = USER_ROLE_PREFIX[role];
  
  // 過濾出相同前綴的編號
  const sameTypeNumbers = existingNumbers
    .filter(no => no.startsWith(prefix))
    .map(no => parseInt(no.substring(1)));
  
  // 找出最大編號
  const maxNumber = sameTypeNumbers.length > 0 
    ? Math.max(...sameTypeNumbers) 
    : 0;
  
  // 生成新編號
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}${newNumber}`;
}; 