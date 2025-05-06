"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.formatCurrency = void 0;
const formatCurrency = (amount) => {
    // 確保輸入是數字
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return '$0';
    }
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numAmount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('zh-TW');
};
exports.formatDate = formatDate;
