import { apiClient } from './api.service';

// 會計整合服務 - 實現正確的程式邏輯
export const accountingIntegrationService = {
    // 1. 從會費管理「收款狀況」帶入應收帳款
    syncFeeReceivables: async () => {
        try {
            console.log('開始同步會費應收帳款...');

            // 取得會費管理的待收款項目
            const feeResponse = await apiClient.get('/fees?status=pending');
            const pendingFees = feeResponse.data || [];

            console.log(`找到 ${pendingFees.length} 筆待收款會費`);

            // 為每個待收款會費建立應收帳款
            const createdReceivables = [];
            for (const fee of pendingFees) {
                try {
                    // 檢查是否已存在對應的應收帳款
                    const existingResponse = await apiClient.get(`/accounting/receivables?search=${fee.member_name}&status=pending`);
                    const existing = existingResponse.data.receivables || [];

                    const alreadyExists = existing.some((receivable: any) =>
                        receivable.customer_name === fee.member_name &&
                        receivable.amount === fee.amount &&
                        receivable.description?.includes('會費')
                    );

                    if (!alreadyExists) {
                        const receivableData = {
                            customer_id: fee.member_id,
                            customer_name: fee.member_name,
                            invoice_number: `FEE-${fee.member_no}-${new Date().getFullYear()}`,
                            amount: fee.amount,
                            due_date: fee.due_date,
                            description: `會費 - ${fee.member_name} (${fee.member_type})`,
                            status: 'pending'
                        };

                        const response = await apiClient.post('/accounting/receivables', receivableData);
                        createdReceivables.push(response.data);
                        console.log(`已建立會費應收帳款: ${fee.member_name} - ${fee.amount}`);
                    }
                } catch (error) {
                    console.error(`建立會費應收帳款失敗 (${fee.member_name}):`, error);
                }
            }

            console.log(`成功同步 ${createdReceivables.length} 筆會費應收帳款`);
            return createdReceivables;
        } catch (error) {
            console.error('同步會費應收帳款失敗:', error);
            throw error;
        }
    },

    // 2. 從投資管理「租金收款管理」帶入應收帳款
    syncRentalReceivables: async () => {
        try {
            console.log('開始同步租金應收帳款...');

            // 取得租金收款管理的待收款項目
            const rentalResponse = await apiClient.get('/rental-payments?status=pending');
            const pendingRentals = rentalResponse.data || [];

            console.log(`找到 ${pendingRentals.length} 筆待收款租金`);

            // 為每個待收款租金建立應收帳款
            const createdReceivables = [];
            for (const rental of pendingRentals) {
                try {
                    // 檢查是否已存在對應的應收帳款
                    const existingResponse = await apiClient.get(`/accounting/receivables?search=${rental.renterName}&status=pending`);
                    const existing = existingResponse.data.receivables || [];

                    const alreadyExists = existing.some((receivable: any) =>
                        receivable.customer_name === rental.renterName &&
                        receivable.amount === rental.amount &&
                        receivable.description?.includes('租金')
                    );

                    if (!alreadyExists) {
                        const receivableData = {
                            customer_id: rental.renterId || 'unknown',
                            customer_name: rental.renterName,
                            invoice_number: `RENTAL-${rental.investmentId}-${rental.year}-${rental.month}`,
                            amount: rental.amount,
                            due_date: `${rental.year}-${rental.month.toString().padStart(2, '0')}-01`,
                            description: `租金 - ${rental.investmentName} (${rental.year}年${rental.month}月)`,
                            status: 'pending'
                        };

                        const response = await apiClient.post('/accounting/receivables', receivableData);
                        createdReceivables.push(response.data);
                        console.log(`已建立租金應收帳款: ${rental.renterName} - ${rental.amount}`);
                    }
                } catch (error) {
                    console.error(`建立租金應收帳款失敗 (${rental.renterName}):`, error);
                }
            }

            console.log(`成功同步 ${createdReceivables.length} 筆租金應收帳款`);
            return createdReceivables;
        } catch (error) {
            console.error('同步租金應收帳款失敗:', error);
            throw error;
        }
    },

    // 3. 從投資管理「會員分潤管理」帶入應付帳款
    syncMemberProfitPayables: async () => {
        try {
            console.log('開始同步會員分潤應付帳款...');

            // 取得會員分潤管理的待付款項目
            const profitResponse = await apiClient.get('/member-profits?status=pending');
            const pendingProfits = profitResponse.data || [];

            console.log(`找到 ${pendingProfits.length} 筆待付款分潤`);

            // 為每個待付款分潤建立應付帳款
            const createdPayables = [];
            for (const profit of pendingProfits) {
                try {
                    // 檢查是否已存在對應的應付帳款
                    const existingResponse = await apiClient.get(`/accounting/payables?search=${profit.memberName}&status=pending`);
                    const existing = existingResponse.data.payables || [];

                    const alreadyExists = existing.some((payable: any) =>
                        payable.supplier_name === profit.memberName &&
                        payable.amount === profit.amount &&
                        payable.description?.includes('分潤')
                    );

                    if (!alreadyExists) {
                        const payableData = {
                            supplier_id: profit.memberId,
                            supplier_name: profit.memberName,
                            invoice_number: `PROFIT-${profit.investmentId}-${profit.year}-${profit.month}`,
                            amount: profit.amount,
                            due_date: `${profit.year}-${profit.month.toString().padStart(2, '0')}-01`,
                            description: `會員分潤 - ${profit.investmentName} (${profit.year}年${profit.month}月)`,
                            status: 'pending'
                        };

                        const response = await apiClient.post('/accounting/payables', payableData);
                        createdPayables.push(response.data);
                        console.log(`已建立分潤應付帳款: ${profit.memberName} - ${profit.amount}`);
                    }
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

    // 4. 執行完整同步（會費、租金、分潤）
    syncAllAccountingData: async () => {
        try {
            console.log('開始執行完整會計資料同步...');

            const results = {
                feeReceivables: [],
                rentalReceivables: [],
                profitPayables: []
            };

            // 同步會費應收帳款
            try {
                results.feeReceivables = await accountingIntegrationService.syncFeeReceivables();
            } catch (error) {
                console.error('同步會費應收帳款失敗:', error);
            }

            // 同步租金應收帳款
            try {
                results.rentalReceivables = await accountingIntegrationService.syncRentalReceivables();
            } catch (error) {
                console.error('同步租金應收帳款失敗:', error);
            }

            // 同步分潤應付帳款
            try {
                results.profitPayables = await accountingIntegrationService.syncMemberProfitPayables();
            } catch (error) {
                console.error('同步分潤應付帳款失敗:', error);
            }

            console.log('完整會計資料同步完成:', results);
            return results;
        } catch (error) {
            console.error('完整會計資料同步失敗:', error);
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