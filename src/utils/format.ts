export const formatCurrency = (amount: number): string => {
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

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('zh-TW');
};
