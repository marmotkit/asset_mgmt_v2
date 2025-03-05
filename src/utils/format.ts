export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('zh-TW');
};
