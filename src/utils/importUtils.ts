import * as XLSX from 'xlsx';
import { User, UserRole, UserStatus } from '../types/user';

interface ImportResult {
  success: boolean;
  data?: Partial<User>[];
  errors?: string[];
}

// 更新角色映射
const roleMap: Record<string, UserRole> = {
  '管理員': 'admin',
  '一般會員': 'normal',
  '終身會員': 'lifetime'
};

// 更新狀態映射
const statusMap: Record<string, UserStatus> = {
  '啟用': 'active',
  '停用': 'inactive',
  '暫停': 'suspended'
};

// 將中文角色轉換為系統角色
const stringToRole = (role: string): UserRole | undefined => {
  return roleMap[role] || 'normal';
};

// 將中文狀態轉換為系統狀態
const stringToStatus = (status: string): UserStatus | undefined => {
  return statusMap[status] || 'inactive';
};

// 驗證電子郵件格式
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 驗證手機號碼格式
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone);
};

// 解析 Excel 檔案
export const parseExcelFile = async (file: File): Promise<ImportResult> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const errors: string[] = [];
    const users: Partial<User>[] = [];

    jsonData.forEach((row: any, index) => {
      const rowNumber = index + 2; // Excel 從第 2 行開始（第 1 行是標題）
      const user: Partial<User> = {};

      // 必填欄位檢查
      if (!row['帳號']) {
        errors.push(`第 ${rowNumber} 行：帳號為必填欄位`);
        return;
      }

      if (!row['電子郵件']) {
        errors.push(`第 ${rowNumber} 行：電子郵件為必填欄位`);
        return;
      }

      // 資料格式驗證
      if (!isValidEmail(row['電子郵件'])) {
        errors.push(`第 ${rowNumber} 行：電子郵件格式不正確`);
        return;
      }

      if (row['電話'] && !isValidPhone(row['電話'])) {
        errors.push(`第 ${rowNumber} 行：電話號碼格式不正確`);
        return;
      }

      // 角色和狀態驗證
      const role = stringToRole(row['會員等級']);
      if (row['會員等級'] && !role) {
        errors.push(`第 ${rowNumber} 行：無效的會員等級`);
        return;
      }

      const status = stringToStatus(row['狀態']);
      if (row['狀態'] && !status) {
        errors.push(`第 ${rowNumber} 行：無效的狀態`);
        return;
      }

      // 組裝使用者資料
      user.username = row['帳號'];
      user.email = row['電子郵件'];
      user.firstName = row['名'] || '';
      user.lastName = row['姓'] || '';
      user.phone = row['電話'] || '';
      user.role = role || 'normal';
      user.status = status || 'inactive';

      users.push(user);
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      errors: ['檔案解析失敗，請確認檔案格式是否正確'],
    };
  }
};

// 驗證 CSV 檔案格式
export const validateCsvFormat = (content: string): boolean => {
  const expectedHeaders = [
    '帳號',
    '姓',
    '名',
    '電子郵件',
    '電話',
    '會員等級',
    '狀態',
  ];

  const lines = content.split('\n');
  if (lines.length < 2) return false;

  const headers = lines[0].trim().split(',');
  return expectedHeaders.every(header => headers.includes(header));
};

// 解析 CSV 檔案
export const parseCsvFile = async (file: File): Promise<ImportResult> => {
  try {
    const content = await file.text();
    if (!validateCsvFormat(content)) {
      return {
        success: false,
        errors: ['CSV 檔案格式不正確，請確認欄位名稱是否正確'],
      };
    }

    // 將 CSV 轉換為工作表格式，再使用相同的解析邏輯
    const workbook = XLSX.read(content, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return parseExcelFile(new File([content], file.name));
  } catch (error) {
    return {
      success: false,
      errors: ['檔案解析失敗，請確認檔案格式是否正確'],
    };
  }
};

// 更新轉換函數
export const convertToUserRole = (role: string): UserRole => {
  return roleMap[role] || 'normal';
};

export const convertToUserStatus = (status: string): UserStatus => {
  return statusMap[status] || 'inactive';
}; 