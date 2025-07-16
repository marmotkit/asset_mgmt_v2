const axios = require('axios');

// 測試會計整合服務
async function testAccountingIntegration() {
    const baseURL = 'https://asset-mgmt-v2.onrender.com';

    console.log('=== 測試會計整合服務 ===\n');

    try {
        // 1. 測試會費 API
        console.log('1. 測試會費 API...');
        const feesResponse = await axios.get(`${baseURL}/api/fees`);
        console.log(`會費數量: ${feesResponse.data.length}`);

        const pendingFees = feesResponse.data.filter(fee =>
            fee.status === '待收款' || fee.status === '逾期'
        );
        console.log(`待收款會費數量: ${pendingFees.length}`);

        if (pendingFees.length > 0) {
            console.log('待收款會費範例:', pendingFees[0]);
        }

        // 2. 測試投資 API
        console.log('\n2. 測試投資 API...');
        try {
            const investmentsResponse = await axios.get(`${baseURL}/api/investments`);
            console.log(`投資項目數量: ${investmentsResponse.data.length}`);

            const rentalInvestments = investmentsResponse.data.filter(inv =>
                inv.type === 'rental' || inv.description?.includes('租賃')
            );
            console.log(`租賃投資項目數量: ${rentalInvestments.length}`);

            if (rentalInvestments.length > 0) {
                console.log('租賃投資範例:', rentalInvestments[0]);
            }
        } catch (error) {
            console.log('投資 API 不可用:', error.message);
        }

        // 3. 測試應收帳款 API
        console.log('\n3. 測試應收帳款 API...');
        const receivablesResponse = await axios.get(`${baseURL}/api/accounting/receivables`);
        console.log(`應收帳款數量: ${receivablesResponse.data.receivables?.length || 0}`);

        const receivables = receivablesResponse.data.receivables || [];
        const feeReceivables = receivables.filter(r => r.description?.includes('會費'));
        const rentalReceivables = receivables.filter(r => r.description?.includes('租金'));

        console.log(`會費應收帳款: ${feeReceivables.length}`);
        console.log(`租金應收帳款: ${rentalReceivables.length}`);

        if (feeReceivables.length > 0) {
            console.log('會費應收帳款範例:', feeReceivables[0]);
        }
        if (rentalReceivables.length > 0) {
            console.log('租金應收帳款範例:', rentalReceivables[0]);
        }

        // 4. 測試同步功能
        console.log('\n4. 測試同步功能...');

        // 同步會費
        console.log('同步會費應收帳款...');
        try {
            const syncFeesResponse = await axios.post(`${baseURL}/api/accounting/sync-fees`);
            console.log('會費同步結果:', syncFeesResponse.data);
        } catch (error) {
            console.log('會費同步失敗:', error.response?.data || error.message);
        }

        // 同步租金
        console.log('同步租金應收帳款...');
        try {
            const syncRentalsResponse = await axios.post(`${baseURL}/api/accounting/sync-rentals`);
            console.log('租金同步結果:', syncRentalsResponse.data);
        } catch (error) {
            console.log('租金同步失敗:', error.response?.data || error.message);
        }

        // 5. 再次檢查應收帳款
        console.log('\n5. 同步後檢查應收帳款...');
        const receivablesAfterResponse = await axios.get(`${baseURL}/api/accounting/receivables`);
        const receivablesAfter = receivablesAfterResponse.data.receivables || [];
        const feeReceivablesAfter = receivablesAfter.filter(r => r.description?.includes('會費'));
        const rentalReceivablesAfter = receivablesAfter.filter(r => r.description?.includes('租金'));

        console.log(`同步後會費應收帳款: ${feeReceivablesAfter.length}`);
        console.log(`同步後租金應收帳款: ${rentalReceivablesAfter.length}`);

    } catch (error) {
        console.error('測試失敗:', error.response?.data || error.message);
    }
}

// 執行測試
testAccountingIntegration(); 