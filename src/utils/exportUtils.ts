import { User, UserRole, UserStatus } from '../types/user';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理員',
  normal: '一般會員',
  business: '商務會員',
  lifetime: '永久會員'
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: '啟用',
  inactive: '停用',
  suspended: '暫停'
};

// 轉換使用者角色為中文
const roleToString = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    admin: '管理員',
    normal: '一般會員',
    business: '商務會員',
    lifetime: '永久會員'
  };
  return roleMap[role] || role;
};

// 轉換使用者狀態為中文
const statusToString = (status: UserStatus): string => {
  const statusMap: Record<UserStatus, string> = {
    active: '啟用',
    inactive: '停用',
    suspended: '暫停'
  };
  return statusMap[status] || status;
};

// 格式化日期
export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy/MM/dd');
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy/MM/dd HH:mm:ss');
};

// 匯出 Excel
export const exportToExcel = (users: User[], fileName: string = 'users.xlsx') => {
  const data = users.map(user => ({
    '帳號': user.username,
    '姓名': user.name,
    '電子郵件': user.email,
    '會員編號': user.memberNo,
    '會員等級': roleToString(user.role),
    '狀態': statusToString(user.status),
    '建立時間': formatDateTime(user.createdAt),
    '最後更新': formatDateTime(user.updatedAt)
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '會員資料');
  XLSX.writeFile(wb, fileName);
};

// 匯出 CSV
export const exportToCsv = (users: User[], fileName: string = 'users.csv') => {
  const headers = ['帳號', '姓名', '電子郵件', '會員編號', '會員等級', '狀態', '建立時間', '最後更新'];

  const rows = users.map(user => [
    user.username,
    user.name,
    user.email,
    user.memberNo,
    roleToString(user.role),
    statusToString(user.status),
    formatDateTime(user.createdAt),
    formatDateTime(user.updatedAt)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};