const axios = require('axios');

// 設置 API 客戶端
const apiClient = axios.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

async function testSyncAccounting() {
    console.log('🔍 開始檢查並同步會計資料...\n');

    try {
        // 1. 檢查會費管理資料
        console.log('1. 檢查會費管理資料...');
        try {
            const feesResponse = await apiClient.get('/fees');
            console.log(`✅ 會費記錄數量: ${feesResponse.data.length || 0}`);

            if (feesResponse.data && feesResponse.data.length > 0) {
                console.log('會費記錄範例:', feesResponse.data[0]);
            }
        } catch (error) {
            console.log('❌ 會費 API 錯誤:', error.response?.status);
        }

        // 2. 檢查租金收款資料
        console.log('\n2. 檢查租金收款資料...');
        try {
            const rentalPaymentsResponse = await apiClient.get('/rental-payments');
            console.log(`✅ 租金收款記錄數量: ${rentalPaymentsResponse.data.length || 0}`);

            if (rentalPaymentsResponse.data && rentalPaymentsResponse.data.length > 0) {
                console.log('租金收款記錄範例:', rentalPaymentsResponse.data[0]);
            }
        } catch (error) {
            console.log('❌ 租金收款 API 錯誤:', error.response?.status);
        }

        // 3. 檢查會員分潤資料
        console.log('\n3. 檢查會員分潤資料...');
        try {
            const memberProfitsResponse = await apiClient.get('/member-profits');
            console.log(`✅ 會員分潤記錄數量: ${memberProfitsResponse.data.length || 0}`);

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
        } catch (error) {
            console.log('❌ 應收帳款 API 錯誤:', error.response?.status);
        }

        // 5. 檢查現有應付帳款
        console.log('\n5. 檢查現有應付帳款...');
        try {
            const payablesResponse = await apiClient.get('/accounting/payables');
            console.log(`✅ 應付帳款數量: ${payablesResponse.data.payables?.length || 0}`);
        } catch (error) {
            console.log('❌ 應付帳款 API 錯誤:', error.response?.status);
        }

        // 6. 手動建立更多測試應收帳款
        console.log('\n6. 手動建立更多測試應收帳款...');
        const testReceivables = [
            {
                customer_id: 'test-customer-2',
                customer_name: '測試客戶B',
                invoice_number: 'INV-TEST-002',
                amount: 75000,
                due_date: '2025-03-15',
                description: '測試應收帳款 - 租金',
                status: 'pending'
            },
            {
                customer_id: 'test-customer-3',
                customer_name: '測試客戶C',
                invoice_number: 'INV-TEST-003',
                amount: 120000,
                due_date: '2025-03-30',
                description: '測試應收帳款 - 服務費',
                status: 'pending'
            },
            {
                customer_id: 'test-customer-4',
                customer_name: '測試客戶D',
                invoice_number: 'INV-TEST-004',
                amount: 45000,
                due_date: '2025-02-20',
                description: '測試應收帳款 - 會費',
                status: 'partially_paid'
            }
        ];

        for (const receivable of testReceivables) {
            try {
                const createResponse = await apiClient.post('/accounting/receivables', receivable);
                console.log(`✅ 成功建立應收帳款: ${receivable.customer_name} - ${receivable.amount}`);
            } catch (error) {
                console.log(`❌ 建立應收帳款失敗 (${receivable.customer_name}):`, error.response?.status);
            }
        }

        // 7. 手動建立更多測試應付帳款
        console.log('\n7. 手動建立更多測試應付帳款...');
        const testPayables = [
            {
                supplier_id: 'test-supplier-2',
                supplier_name: '測試供應商B',
                invoice_number: 'INV-SUPPLIER-002',
                amount: 25000,
                due_date: '2025-03-10',
                description: '測試應付帳款 - 辦公用品',
                status: 'pending'
            },
            {
                supplier_id: 'test-supplier-3',
                supplier_name: '測試供應商C',
                invoice_number: 'INV-SUPPLIER-003',
                amount: 80000,
                due_date: '2025-03-25',
                description: '測試應付帳款 - 專業服務費',
                status: 'pending'
            },
            {
                supplier_id: 'test-supplier-4',
                supplier_name: '測試供應商D',
                invoice_number: 'INV-SUPPLIER-004',
                amount: 15000,
                due_date: '2025-02-10',
                description: '測試應付帳款 - 會員分潤',
                status: 'paid'
            }
        ];

        for (const payable of testPayables) {
            try {
                const createResponse = await apiClient.post('/accounting/payables', payable);
                console.log(`✅ 成功建立應付帳款: ${payable.supplier_name} - ${payable.amount}`);
            } catch (error) {
                console.log(`❌ 建立應付帳款失敗 (${payable.supplier_name}):`, error.response?.status);
            }
        }

        // 8. 再次檢查應收應付帳款
        console.log('\n8. 再次檢查應收應付帳款...');
        try {
            const receivablesResponse = await apiClient.get('/accounting/receivables');
            console.log(`✅ 應收帳款數量: ${receivablesResponse.data.receivables?.length || 0}`);

            if (receivablesResponse.data.receivables && receivablesResponse.data.receivables.length > 0) {
                console.log('應收帳款記錄數量:', receivablesResponse.data.receivables.length);
                console.log('應收帳款總金額:', receivablesResponse.data.receivables.reduce((sum, item) => sum + parseFloat(item.amount), 0));
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
            }
        } catch (error) {
            console.log('❌ 應付帳款 API 錯誤:', error.response?.status);
        }

        console.log('\n🎯 建議:');
        console.log('1. 如果沒有會費、租金、分潤資料，需要先在對應模組建立資料');
        console.log('2. 使用會計管理頁面的「資料整合」功能執行同步');
        console.log('3. 或者手動在應收應付帳款頁面新增記錄');
        console.log('4. 現在應收應付帳款應該有測試資料可以查看了');

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