"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToCsv = exports.exportToExcel = exports.formatDateTime = exports.formatDate = exports.USER_STATUS_LABELS = exports.USER_ROLE_LABELS = void 0;
const XLSX = __importStar(require("xlsx"));
const date_fns_1 = require("date-fns");
exports.USER_ROLE_LABELS = {
    admin: '管理員',
    normal: '一般會員',
    business: '商務會員',
    lifetime: '永久會員'
};
exports.USER_STATUS_LABELS = {
    active: '啟用',
    inactive: '停用',
    suspended: '暫停'
};
// 轉換使用者角色為中文
const roleToString = (role) => {
    const roleMap = {
        admin: '管理員',
        normal: '一般會員',
        business: '商務會員',
        lifetime: '永久會員'
    };
    return roleMap[role] || role;
};
// 轉換使用者狀態為中文
const statusToString = (status) => {
    const statusMap = {
        active: '啟用',
        inactive: '停用',
        suspended: '暫停'
    };
    return statusMap[status] || status;
};
// 格式化日期
const formatDate = (date) => {
    if (!date)
        return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.format)(dateObj, 'yyyy/MM/dd');
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    if (!date)
        return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_1.format)(dateObj, 'yyyy/MM/dd HH:mm:ss');
};
exports.formatDateTime = formatDateTime;
// 匯出 Excel
const exportToExcel = (users, fileName = 'users.xlsx') => {
    const data = users.map(user => ({
        '帳號': user.username,
        '姓名': user.name,
        '電子郵件': user.email,
        '會員編號': user.memberNo,
        '會員等級': roleToString(user.role),
        '狀態': statusToString(user.status),
        '建立時間': (0, exports.formatDateTime)(user.createdAt),
        '最後更新': (0, exports.formatDateTime)(user.updatedAt)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '會員資料');
    XLSX.writeFile(wb, fileName);
};
exports.exportToExcel = exportToExcel;
// 匯出 CSV
const exportToCsv = (users, fileName = 'users.csv') => {
    const headers = ['帳號', '姓名', '電子郵件', '會員編號', '會員等級', '狀態', '建立時間', '最後更新'];
    const rows = users.map(user => [
        user.username,
        user.name,
        user.email,
        user.memberNo,
        roleToString(user.role),
        statusToString(user.status),
        (0, exports.formatDateTime)(user.createdAt),
        (0, exports.formatDateTime)(user.updatedAt)
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
exports.exportToCsv = exportToCsv;
