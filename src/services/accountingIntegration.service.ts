import { apiClient } from './api.service';

// 會計整合服務 - 實現正確的程式邏輯
export const accountingIntegrationService = {
    // 1. 從會費管理「收款狀況」帶入應收帳款
    syncFeeReceivables: async () => {
        try {
            console.log('開始同步會費應收帳款...');

            // 先清理舊的會費應收帳款
            await accountingIntegrationService.clearFeeReceivables();

            // 取得會費管理的所有項目，然後篩選待收款
            const feeResponse = await apiClient.get('/fees');
            const allFees = feeResponse.data || [];

            // 篩選待收款和逾期的會費
            const pendingFees = allFees.filter(fee =>
                fee.status === '待收款' ||
                fee.status === '逾期' ||
                fee.status === 'pending' ||
                fee.status === 'overdue'
            );

            console.log(`找到 ${pendingFees.length} 筆待收款會費`);

            // 為每個待收款會費建立應收帳款
            const createdReceivables = [];
            for (const fee of pendingFees) {
                try {
                    const receivableData = {
                        customer_id: fee.memberId || fee.member_id || `fee-${fee.id}`,
                        customer_name: fee.memberName || fee.member_name || '未知會員',
                        invoice_number: `FEE-${fee.memberNo || fee.member_no || fee.id}-${new Date().getFullYear()}`,
                        amount: fee.amount || 0,
                        due_date: fee.dueDate || fee.due_date || new Date().toISOString().split('T')[0],
                        description: `會費 - ${fee.memberName || fee.member_name || '未知會員'} (${fee.memberType || fee.member_type || '一般會員'})`,
                        status: 'pending'
                    };

                    const response = await apiClient.post('/accounting/receivables', receivableData);
                    createdReceivables.push(response.data);
                    console.log(`已建立會費應收帳款: ${receivableData.customer_name} - ${receivableData.amount}`);
                } catch (error) {
                    console.error(`建立會費應收帳款失敗 (${fee.memberName || fee.member_name}):`, error);
                }
            }

            console.log(`成功同步 ${createdReceivables.length} 筆會費應收帳款`);
            return createdReceivables;
        } catch (error) {
            console.error('同步會費應收帳款失敗:', error);
            throw error;
        }
    },

    // 清理會費應收帳款
    clearFeeReceivables: async () => {
        try {
            console.log('清理舊的會費應收帳款...');
            const response = await apiClient.get('/accounting/receivables?search=會費');
            const feeReceivables = response.data.receivables || [];

            for (const receivable of feeReceivables) {
                try {
                    await apiClient.delete(`/accounting/receivables/${receivable.id}`);
                    console.log(`已刪除會費應收帳款: ${receivable.customer_name}`);
                } catch (error) {
                    console.error(`刪除會費應收帳款失敗: ${receivable.id}`, error);
                }
            }
            console.log(`清理完成，共刪除 ${feeReceivables.length} 筆會費應收帳款`);
        } catch (error) {
            console.error('清理會費應收帳款失敗:', error);
        }
    },

    // 2. 從投資管理「租金收款管理」帶入應收帳款
    syncRentalReceivables: async () => {
        try {
            console.log('開始同步租金應收帳款...');

            // 先清理舊的租金應收帳款
            await accountingIntegrationService.clearRentalReceivables();

            // 嘗試不同的租金 API 路徑
            let rentalData = [];
            try {
                // 嘗試租金收款 API
                const rentalResponse = await apiClient.get('/rental-payments');
                rentalData = rentalResponse.data || [];
            } catch (error) {
                console.log('租金收款 API 不存在，嘗試投資管理 API...');
                try {
                    // 嘗試投資管理 API
                    const investmentResponse = await apiClient.get('/investments');
                    const investments = investmentResponse.data || [];

                    // 從投資項目中提取租金資料
                    for (const investment of investments) {
                        if (investment.type === 'rental' || investment.description?.includes('租賃')) {
                            // 為每個投資項目生成年度租金記錄
                            const currentYear = new Date().getFullYear();
                            for (let month = 1; month <= 12; month++) {
                                rentalData.push({
                                    id: `rental-${investment.id}-${currentYear}-${month}`,
                                    investmentId: investment.id,
                                    investmentName: investment.name || investment.description,
                                    renterName: investment.renterName || investment.tenant || '未知承租人',
                                    year: currentYear,
                                    month: month,
                                    rentalAmount: investment.rentalAmount || 54000,
                                    status: month <= new Date().getMonth() + 1 ? '待收款' : '待收款',
                                    dueDate: `${currentYear}-${String(month).padStart(2, '0')}-01`
                                });
                            }
                        }
                    }
                } catch (innerError) {
                    console.error('無法取得租金資料:', innerError);
                }
            }

            // 篩選待收款和逾期的租金
            const pendingRentals = rentalData.filter(rental =>
                rental.status === '待收款' ||
                rental.status === '逾期' ||
                rental.status === 'pending' ||
                rental.status === 'overdue'
            );

            console.log(`找到 ${pendingRentals.length} 筆待收款租金`);

            // 為每個待收款租金建立應收帳款
            const createdReceivables = [];
            for (const rental of pendingRentals) {
                try {
                    const receivableData = {
                        customer_id: rental.renterName || rental.tenant || `rental-${rental.id}`,
                        customer_name: rental.renterName || rental.tenant || '未知承租人',
                        invoice_number: `RENTAL-${rental.investmentId || rental.id}-${rental.year || new Date().getFullYear()}-${rental.month || new Date().getMonth() + 1}`,
                        amount: rental.rentalAmount || rental.amount || 0,
                        due_date: rental.dueDate || `${rental.year || new Date().getFullYear()}-${String(rental.month || new Date().getMonth() + 1).padStart(2, '0')}-01`,
                        description: `租金 - ${rental.renterName || rental.tenant || '未知承租人'} (${rental.year || new Date().getFullYear()}年${rental.month || new Date().getMonth() + 1}月)`,
                        status: 'pending'
                    };

                    const response = await apiClient.post('/accounting/receivables', receivableData);
                    createdReceivables.push(response.data);
                    console.log(`已建立租金應收帳款: ${receivableData.customer_name} - ${receivableData.amount}`);
                } catch (error) {
                    console.error(`建立租金應收帳款失敗 (${rental.renterName || rental.tenant}):`, error);
                }
            }

            console.log(`成功同步 ${createdReceivables.length} 筆租金應收帳款`);
            return createdReceivables;
        } catch (error) {
            console.error('同步租金應收帳款失敗:', error);
            throw error;
        }
    },

    // 清理租金應收帳款
    clearRentalReceivables: async () => {
        try {
            console.log('清理舊的租金應收帳款...');
            const response = await apiClient.get('/accounting/receivables?search=租金');
            const rentalReceivables = response.data.receivables || [];

            for (const receivable of rentalReceivables) {
                try {
                    await apiClient.delete(`/accounting/receivables/${receivable.id}`);
                    console.log(`已刪除租金應收帳款: ${receivable.customer_name}`);
                } catch (error) {
                    console.error(`刪除租金應收帳款失敗: ${receivable.id}`, error);
                }
            }
            console.log(`清理完成，共刪除 ${rentalReceivables.length} 筆租金應收帳款`);
        } catch (error) {
            console.error('清理租金應收帳款失敗:', error);
        }
    },

    // 3. 從投資管理「會員分潤管理」帶入應付帳款
    syncMemberProfitPayables: async () => {
        try {
            console.log('開始同步會員分潤應付帳款...');

            // 先清理舊的分潤應付帳款
            await accountingIntegrationService.clearProfitPayables();

            // 取得會員分潤管理的待付款項目（全年度）
            const profitResponse = await apiClient.get('/member-profits?status=待付款');
            const pendingProfits = profitResponse.data || [];

            console.log(`找到 ${pendingProfits.length} 筆待付款分潤`);

            // 為每個待付款分潤建立應付帳款
            const createdPayables = [];
            for (const profit of pendingProfits) {
                try {
                    const payableData = {
                        supplier_id: profit.memberName || profit.memberId || `profit-${profit.id}`,
                        supplier_name: profit.memberName || '未知會員',
                        invoice_number: `PROFIT-${profit.memberId || profit.id}-${profit.year || new Date().getFullYear()}-${profit.month || new Date().getMonth() + 1}`,
                        amount: profit.profitAmount || profit.amount || 0,
                        due_date: profit.dueDate || `${profit.year || new Date().getFullYear()}-${String(profit.month || new Date().getMonth() + 1).padStart(2, '0')}-01`,
                        description: `會員分潤 - ${profit.memberName || '未知會員'} (${profit.year || new Date().getFullYear()}年${profit.month || new Date().getMonth() + 1}月)`,
                        status: 'pending'
                    };

                    const response = await apiClient.post('/accounting/payables', payableData);
                    createdPayables.push(response.data);
                    console.log(`已建立分潤應付帳款: ${payableData.supplier_name} - ${payableData.amount}`);
                } catch (error) {
                    console.error(`建立分潤應付帳款失敗 (${profit.memberName}):`, error);
                }
            }

            console.log(`成功同步 ${createdPayables.length} 筆分潤應付帳款`);
            return createdPayables;
        } catch (error) {
            console.error('同步會員分潤應付帳款失敗:', error);
            throw error;
        }
    },

    // 清理分潤應付帳款
    clearProfitPayables: async () => {
        try {
            console.log('清理舊的分潤應付帳款...');
            const response = await apiClient.get('/accounting/payables?search=會員分潤');
            const profitPayables = response.data.payables || [];

            for (const payable of profitPayables) {
                try {
                    await apiClient.delete(`/accounting/payables/${payable.id}`);
                    console.log(`已刪除分潤應付帳款: ${payable.supplier_name}`);
                } catch (error) {
                    console.error(`刪除分潤應付帳款失敗: ${payable.id}`, error);
                }
            }
            console.log(`清理完成，共刪除 ${profitPayables.length} 筆分潤應付帳款`);
        } catch (error) {
            console.error('清理分潤應付帳款失敗:', error);
        }
    },

    // 完整同步所有會計資料
    syncAllAccountingData: async () => {
        try {
            console.log('開始完整同步會計資料...');

            const [feeReceivables, rentalReceivables, profitPayables] = await Promise.all([
                accountingIntegrationService.syncFeeReceivables(),
                accountingIntegrationService.syncRentalReceivables(),
                accountingIntegrationService.syncMemberProfitPayables()
            ]);

            console.log('完整同步完成:', {
                feeReceivables: feeReceivables.length,
                rentalReceivables: rentalReceivables.length,
                profitPayables: profitPayables.length
            });

            return {
                feeReceivables,
                rentalReceivables,
                profitPayables
            };
        } catch (error) {
            console.error('完整同步失敗:', error);
            throw error;
        }
    },

    // 5. 月結時自動同步資料
    syncBeforeMonthlyClosing: async (year: number, month: number) => {
        try {
            console.log(`執行月結前資料同步 (${year}年${month}月)...`);

            // 先同步所有會計資料
            await accountingIntegrationService.syncAllAccountingData();

            // 檢查該月份的資料完整性
            const journalResponse = await apiClient.get(`/accounting/journal?year=${year}&month=${month}`);
            const receivablesResponse = await apiClient.get(`/accounting/receivables?year=${year}&month=${month}`);
            const payablesResponse = await apiClient.get(`/accounting/payables?year=${year}&month=${month}`);

            const summary = {
                journalCount: journalResponse.data.length || 0,
                receivablesCount: receivablesResponse.data.receivables?.length || 0,
                payablesCount: payablesResponse.data.payables?.length || 0,
                totalReceivables: receivablesResponse.data.receivables?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0,
                totalPayables: payablesResponse.data.payables?.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0) || 0
            };

            console.log(`月結前資料同步完成:`, summary);
            return summary;
        } catch (error) {
            console.error('月結前資料同步失敗:', error);
            throw error;
        }
    }
}; 