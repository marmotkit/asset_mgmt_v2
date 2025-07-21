"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRecordsService = void 0;
const api_service_1 = require("./api.service");
// 日期格式化函數
const formatDateForDisplay = (dateString) => {
    if (!dateString)
        return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return '日期格式錯誤';
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    catch (error) {
        console.error('日期格式化錯誤:', error);
        return '日期格式錯誤';
    }
};
exports.systemRecordsService = {
    // 獲取所有金流記錄
    getAllRecords: async () => {
        try {
            const [fees, rentals, profits] = await Promise.all([
                exports.systemRecordsService.getFeeRecords(),
                exports.systemRecordsService.getRentalRecords(),
                exports.systemRecordsService.getProfitRecords()
            ]);
            // 合併所有記錄並按日期排序
            const allRecords = [...fees, ...rentals, ...profits];
            return allRecords.sort((a, b) => (b.sortDate || 0) - (a.sortDate || 0));
        }
        catch (error) {
            console.error('獲取所有金流記錄失敗:', error);
            return;
        }
    },
    // 獲取會費異動記錄
    getFeeRecords: async () => {
        try {
            const response = await api_service_1.apiClient.get('/fees');
            const fees = response.data || [];
            return fees.map((fee) => {
                const originalDate = fee.paidDate || fee.dueDate || fee.createdAt;
                return {
                    id: `fee-${fee.id}`,
                    type: '會費異動',
                    year: new Date(originalDate).getFullYear(),
                    date: formatDateForDisplay(originalDate),
                    desc: `${fee.memberName || '未知會員'} - ${fee.status === '已收款' ? '繳交會費' : '會費異動'}`,
                    amount: fee.status === '已收款' ? fee.amount : 0,
                    status: fee.status || '正常',
                    hidden: false,
                    sourceId: fee.id,
                    memberName: fee.memberName,
                    sortDate: new Date(originalDate).getTime()
                };
            });
        }
        catch (error) {
            console.error('獲取會費記錄失敗:', error);
            return;
        }
    },
    // 獲取租金收款記錄
    getRentalRecords: async () => {
        try {
            const response = await api_service_1.apiClient.get('/rental-payments');
            const rentals = response.data || [];
            return rentals.map((rental) => {
                let displayDate = '';
                let sortDate = 0;
                if (rental.paymentDate) {
                    displayDate = formatDateForDisplay(rental.paymentDate);
                    sortDate = new Date(rental.paymentDate).getTime();
                }
                else if (rental.year && rental.month && rental.day) {
                    const dateStr = `${rental.year}-${String(rental.month).padStart(2, '0')}-${String(rental.day).padStart(2, '0')}`;
                    displayDate = formatDateForDisplay(dateStr);
                    sortDate = new Date(dateStr).getTime();
                }
                else {
                    displayDate = `${rental.year}年${rental.month}月`;
                    sortDate = new Date(`${rental.year}-${String(rental.month).padStart(2, '0')}-01`).getTime();
                }
                return {
                    id: `rental-${rental.id}`,
                    type: '租金收款',
                    year: rental.year,
                    date: displayDate,
                    desc: `${rental.investment_name || '未知投資案'} - ${rental.year}年${rental.month}月租金收款`,
                    amount: rental.amount || 0,
                    status: rental.status || '正常',
                    hidden: false,
                    sourceId: rental.id,
                    investmentName: rental.investment_name,
                    sortDate
                };
            });
        }
        catch (error) {
            console.error('獲取租金收款記錄失敗:', error);
            return;
        }
    },
    // 獲取會員分潤記錄
    getProfitRecords: async () => {
        try {
            const response = await api_service_1.apiClient.get('/member-profits');
            const profits = response.data || [];
            return profits.map((profit) => {
                let displayDate = '';
                let sortDate = 0;
                if (profit.paymentDate) {
                    displayDate = formatDateForDisplay(profit.paymentDate);
                    sortDate = new Date(profit.paymentDate).getTime();
                }
                else if (profit.year && profit.month && profit.day) {
                    const dateStr = `${profit.year}-${String(profit.month).padStart(2, '0')}-${String(profit.day).padStart(2, '0')}`;
                    displayDate = formatDateForDisplay(dateStr);
                    sortDate = new Date(dateStr).getTime();
                }
                else {
                    displayDate = `${profit.year}年${profit.month}月`;
                    sortDate = new Date(`${profit.year}-${String(profit.month).padStart(2, '0')}-01`).getTime();
                }
                return {
                    id: `profit-${profit.id}`,
                    type: '會員分潤',
                    year: profit.year,
                    date: displayDate,
                    desc: `${profit.memberName || '未知會員'} - ${profit.investmentName || '未知投資案'} ${profit.year}年${profit.month}月分潤`,
                    amount: profit.amount || 0,
                    status: profit.status || '正常',
                    hidden: false,
                    sourceId: profit.id,
                    memberName: profit.memberName,
                    investmentName: profit.investmentName,
                    sortDate
                };
            });
        }
        catch (error) {
            console.error('獲取會員分潤記錄失敗:', error);
            return;
        }
    },
    // 隱藏/顯示記錄
    toggleRecordVisibility: async (recordId, hidden) => {
        try {
            // 這裡可以實作實際的 API 調用來更新記錄狀態
            // 目前先返回成功
            console.log(`切換記錄 ${recordId} 的顯示狀態為: ${hidden}`);
            return true;
        }
        catch (error) {
            console.error('切換記錄顯示狀態失敗:', error);
            return false;
        }
    },
    // 刪除記錄
    deleteRecord: async (recordId) => {
        try {
            // 解析記錄類型並調用對應的刪除 API
            const [type, id] = recordId.split('-');
            switch (type) {
                case 'fee':
                    await api_service_1.apiClient.delete(`/fees/${id}`);
                    break;
                case 'rental':
                    await api_service_1.apiClient.delete(`/rental-payments/${id}`);
                    break;
                case 'profit':
                    await api_service_1.apiClient.delete(`/member-profits/${id}`);
                    break;
                default:
                    throw new Error('未知的記錄類型');
            }
            return true;
        }
        catch (error) {
            console.error('刪除記錄失敗:', error);
            return false;
        }
    }
};
