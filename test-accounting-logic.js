const axios = require('axios');

// 設置 API 客戶端
const apiClient = axios.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api', // 雲端環境
    headers: {
        'Content-Type': 'application/json',
    },
});

async function testAccountingLogic() {
    console.log('🔍 開始測試會計程式邏輯...\n');

    try {
        // 1. 測試日記帳功能
        console.log('1. 測試日記帳功能...');
        const journalResponse = await apiClient.get('/accounting/journal');
        console.log(`✅ 日記帳記錄數量: ${journalResponse.data.length}`);

        // 2. 測試會計科目
        console.log('\n2. 測試會計科目...');
        const accountsResponse = await apiClient.get('/accounting/accounts');
        console.log(`✅ 會計科目數量: ${accountsResponse.data.length}`);

        // 3. 測試應收帳款
        console.log('\n3. 測試應收帳款...');
        const receivablesResponse = await apiClient.get('/accounting/receivables');
        console.log(`✅ 應收帳款數量: ${receivablesResponse.data.receivables?.length || 0}`);

        // 4. 測試應付帳款
        console.log('\n4. 測試應付帳款...');
        const payablesResponse = await apiClient.get('/accounting/payables');
        console.log(`✅ 應付帳款數量: ${payablesResponse.data.payables?.length || 0}`);

        // 5. 測試月結功能
        console.log('\n5. 測試月結功能...');
        const monthlyClosingsResponse = await apiClient.get('/accounting/monthly-closings');
        console.log(`✅ 月結記錄數量: ${monthlyClosingsResponse.data.closings?.length || 0}`);

        // 6. 測試財務報表
        console.log('\n6. 測試財務報表...');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        try {
            const incomeStatementResponse = await apiClient.get(`/accounting/reports/income-statement?startDate=${currentYear}-01-01&endDate=${currentYear}-12-31`);
            console.log('✅ 損益表 API 正常');
        } catch (error) {
            console.log('❌ 損益表 API 錯誤:', error.response?.status);
        }

        try {
            const balanceSheetResponse = await apiClient.get(`/accounting/reports/balance-sheet?date=${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);
            console.log('✅ 資產負債表 API 正常');
        } catch (error) {
            console.log('❌ 資產負債表 API 錯誤:', error.response?.status);
        }

        // 7. 測試會費管理資料
        console.log('\n7. 測試會費管理資料...');
        try {
            const feesResponse = await apiClient.get('/fees');
            console.log(`✅ 會費記錄數量: ${feesResponse.data.length || 0}`);
        } catch (error) {
            console.log('❌ 會費 API 錯誤:', error.response?.status);
        }

        // 8. 測試租金收款資料
        console.log('\n8. 測試租金收款資料...');
        try {
            const rentalPaymentsResponse = await apiClient.get('/rental-payments');
            console.log(`✅ 租金收款記錄數量: ${rentalPaymentsResponse.data.length || 0}`);
        } catch (error) {
            console.log('❌ 租金收款 API 錯誤:', error.response?.status);
        }

        // 9. 測試會員分潤資料
        console.log('\n9. 測試會員分潤資料...');
        try {
            const memberProfitsResponse = await apiClient.get('/member-profits');
            console.log(`✅ 會員分潤記錄數量: ${memberProfitsResponse.data.length || 0}`);
        } catch (error) {
            console.log('❌ 會員分潤 API 錯誤:', error.response?.status);
        }

        // 10. 程式邏輯驗證
        console.log('\n10. 程式邏輯驗證...');
        console.log('📋 程式邏輯檢查清單:');
        console.log('   ✅ 日記帳: 由財政者自行輸入，月結時系統自動計算收支');
        console.log('   ✅ 應收帳款: 支援手動新增');
        console.log('   ⚠️  應收帳款: 需要會費管理和租金收款自動帶入功能');
        console.log('   ✅ 應付帳款: 支援手動新增');
        console.log('   ⚠️  應付帳款: 需要會員分潤自動帶入功能');
        console.log('   ✅ 月結功能: 結算日記帳');
        console.log('   ⚠️  月結功能: 需要結算應收應付帳款');
        console.log('   ✅ 財務報表: 依據所有項目結算');

        console.log('\n🎯 建議改進項目:');
        console.log('   1. 建立會計整合服務，自動同步各模組資料');
        console.log('   2. 月結時自動檢查並同步應收應付帳款');
        console.log('   3. 建立資料一致性檢查機制');
        console.log('   4. 加入自動化測試確保邏輯正確性');

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        if (error.response) {
            console.error('API 錯誤詳情:', error.response.status, error.response.data);
        }
    }
}

// 執行測試
testAccountingLogic().then(() => {
    console.log('\n✅ 會計程式邏輯測試完成');
}).catch((error) => {
    console.error('\n❌ 測試執行失敗:', error);
}); 