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
exports.convertToUserStatus = exports.convertToUserRole = exports.parseCsvFile = exports.validateCsvFormat = exports.parseExcelFile = void 0;
const XLSX = __importStar(require("xlsx"));
// 更新角色映射
const roleMap = {
    '管理員': 'admin',
    '一般會員': 'normal',
    '終身會員': 'lifetime'
};
// 更新狀態映射
const statusMap = {
    '啟用': 'active',
    '停用': 'inactive',
    '暫停': 'suspended'
};
// 將中文角色轉換為系統角色
const stringToRole = (role) => {
    return roleMap[role] || 'normal';
};
// 將中文狀態轉換為系統狀態
const stringToStatus = (status) => {
    return statusMap[status] || 'inactive';
};
// 驗證電子郵件格式
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// 驗證手機號碼格式
const isValidPhone = (phone) => {
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phone);
};
// 解析 Excel 檔案
const parseExcelFile = async (file) => {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const errors = [];
        const users = [];
        jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // Excel 從第 2 行開始（第 1 行是標題）
            const user = {};
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
    }
    catch (error) {
        return {
            success: false,
            errors: ['檔案解析失敗，請確認檔案格式是否正確'],
        };
    }
};
exports.parseExcelFile = parseExcelFile;
// 驗證 CSV 檔案格式
const validateCsvFormat = (content) => {
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
    if (lines.length < 2)
        return false;
    const headers = lines[0].trim().split(',');
    return expectedHeaders.every(header => headers.includes(header));
};
exports.validateCsvFormat = validateCsvFormat;
// 解析 CSV 檔案
const parseCsvFile = async (file) => {
    try {
        const content = await file.text();
        if (!(0, exports.validateCsvFormat)(content)) {
            return {
                success: false,
                errors: ['CSV 檔案格式不正確，請確認欄位名稱是否正確'],
            };
        }
        // 將 CSV 轉換為工作表格式，再使用相同的解析邏輯
        const workbook = XLSX.read(content, { type: 'string' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        return (0, exports.parseExcelFile)(new File([content], file.name));
    }
    catch (error) {
        return {
            success: false,
            errors: ['檔案解析失敗，請確認檔案格式是否正確'],
        };
    }
};
exports.parseCsvFile = parseCsvFile;
// 更新轉換函數
const convertToUserRole = (role) => {
    return roleMap[role] || 'normal';
};
exports.convertToUserRole = convertToUserRole;
const convertToUserStatus = (status) => {
    return statusMap[status] || 'inactive';
};
exports.convertToUserStatus = convertToUserStatus;
