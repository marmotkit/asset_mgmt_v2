const axios = require('axios');

// 設置 API 客戶端
const apiClient = axios.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

async function testSyncAccounting() {
    console.log('🔍 開始測試會計資料同步...\n');

    try {
        // 1. 檢查會費管理資料
        console.log('1. 檢查會費管理資料...');
        try {
            const feesResponse = await apiClient.get('/fees?status=待收款');
            console.log(`✅ 會費待收款數量: ${feesResponse.data.length || 0}`);

            if (feesResponse.data && feesResponse.data.length > 0) {
                console.log('會費記錄範例:', feesResponse.data[0]);
            }
        } catch (error) {
            console.log('❌ 會費 API 錯誤:', error.response?.status);
        }

        // 2. 檢查租金收款資料
        console.log('\n2. 檢查租金收款資料...');
        try {
            const rentalPaymentsResponse = await apiClient.get('/rental-payments?status=待收款');
            console.log(`✅ 租金待收款數量: ${rentalPaymentsResponse.data.length || 0}`);

            if (rentalPaymentsResponse.data && rentalPaymentsResponse.data.length > 0) {
                console.log('租金收款記錄範例:', rentalPaymentsResponse.data[0]);
            }
        } catch (error) {
            console.log('❌ 租金收款 API 錯誤:', error.response?.status);
        }

        // 3. 檢查會員分潤資料
        console.log('\n3. 檢查會員分潤資料...');
        try {
            const memberProfitsResponse = await apiClient.get('/member-profits?status=待付款');
            console.log(`✅ 會員分潤待付款數量: ${memberProfitsResponse.data.length || 0}`);

            if (memberProfitsResponse.data && memberProfitsResponse.data.length > 0) {
                console.log('會員分潤記錄範例:', memberProfitsResponse.data[0]);
            }
        } catch (error) {
            console.log('❌ 會員分潤 API 錯誤:', error.response?.status);
        }

        // 4. 檢查現有應收帳款
        console.log('\n4. 檢查現有應收帳款...');
        try {
            const receivablesResponse = await apiClient.get('/accounting/receivables');
            console.log(`✅ 應收帳款數量: ${receivablesResponse.data.receivables?.length || 0}`);

            if (receivablesResponse.data.receivables && receivablesResponse.data.receivables.length > 0) {
                console.log('應收帳款記錄數量:', receivablesResponse.data.receivables.length);
                console.log('應收帳款總金額:', receivablesResponse.data.receivables.reduce((sum, item) => sum + parseFloat(item.amount), 0));

                // 檢查會費和租金應收帳款
                const feeReceivables = receivablesResponse.data.receivables.filter(item =>
                    item.description && item.description.includes('會費')
                );
                const rentalReceivables = receivablesResponse.data.receivables.filter(item =>
                    item.description && item.description.includes('租金')
                );

                console.log(`會費應收帳款: ${feeReceivables.length} 筆`);
                console.log(`租金應收帳款: ${rentalReceivables.length} 筆`);
            }
        } catch (error) {
            console.log('❌ 應收帳款 API 錯誤:', error.response?.status);
        }

        // 5. 檢查現有應付帳款
        console.log('\n5. 檢查現有應付帳款...');
        try {
            const payablesResponse = await apiClient.get('/accounting/payables');
            console.log(`✅ 應付帳款數量: ${payablesResponse.data.payables?.length || 0}`);

            if (payablesResponse.data.payables && payablesResponse.data.payables.length > 0) {
                console.log('應付帳款記錄數量:', payablesResponse.data.payables.length);
                console.log('應付帳款總金額:', payablesResponse.data.payables.reduce((sum, item) => sum + parseFloat(item.amount), 0));

                // 檢查分潤應付帳款
                const profitPayables = payablesResponse.data.payables.filter(item =>
                    item.description && item.description.includes('會員分潤')
                );

                console.log(`分潤應付帳款: ${profitPayables.length} 筆`);
            }
        } catch (error) {
            console.log('❌ 應付帳款 API 錯誤:', error.response?.status);
        }

        // 6. 測試完整同步
        console.log('\n6. 測試完整同步...');
        try {
            const syncResponse = await apiClient.post('/accounting/integration/sync-all');
            console.log('✅ 完整同步完成:', syncResponse.data);
        } catch (error) {
            console.log('❌ 完整同步失敗:', error.response?.status, error.response?.data);
        }

        // 7. 再次檢查應收應付帳款
        console.log('\n7. 再次檢查應收應付帳款...');
        try {
            const receivablesResponse = await apiClient.get('/accounting/receivables');
            console.log(`✅ 應收帳款數量: ${receivablesResponse.data.receivables?.length || 0}`);

            if (receivablesResponse.data.receivables && receivablesResponse.data.receivables.length > 0) {
                console.log('應收帳款記錄數量:', receivablesResponse.data.receivables.length);
                console.log('應收帳款總金額:', receivablesResponse.data.receivables.reduce((sum, item) => sum + parseFloat(item.amount), 0));

                // 檢查會費和租金應收帳款
                const feeReceivables = receivablesResponse.data.receivables.filter(item =>
                    item.description && item.description.includes('會費')
                );
                const rentalReceivables = receivablesResponse.data.receivables.filter(item =>
                    item.description && item.description.includes('租金')
                );

                console.log(`會費應收帳款: ${feeReceivables.length} 筆`);
                console.log(`租金應收帳款: ${rentalReceivables.length} 筆`);
            }
        } catch (error) {
            console.log('❌ 應收帳款 API 錯誤:', error.response?.status);
        }

        try {
            const payablesResponse = await apiClient.get('/accounting/payables');
            console.log(`✅ 應付帳款數量: ${payablesResponse.data.payables?.length || 0}`);

            if (payablesResponse.data.payables && payablesResponse.data.payables.length > 0) {
                console.log('應付帳款記錄數量:', payablesResponse.data.payables.length);
                console.log('應付帳款總金額:', payablesResponse.data.payables.reduce((sum, item) => sum + parseFloat(item.amount), 0));

                // 檢查分潤應付帳款
                const profitPayables = payablesResponse.data.payables.filter(item =>
                    item.description && item.description.includes('會員分潤')
                );

                console.log(`分潤應付帳款: ${profitPayables.length} 筆`);
            }
        } catch (error) {
            console.log('❌ 應付帳款 API 錯誤:', error.response?.status);
        }

        console.log('\n🎯 建議:');
        console.log('1. 如果會費、租金、分潤資料為空，需要先在對應模組建立資料');
        console.log('2. 使用會計管理頁面的「資料整合」功能執行同步');
        console.log('3. 同步會自動清理舊資料並建立新資料');
        console.log('4. 應收應付帳款頁面已優化欄位顯示');

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        if (error.response) {
            console.error('API 錯誤詳情:', error.response.status, error.response.data);
        }
    }
}

// 執行測試
testSyncAccounting().then(() => {
    console.log('\n✅ 會計資料同步測試完成');
}).catch((error) => {
    console.error('\n❌ 測試執行失敗:', error);
}); 