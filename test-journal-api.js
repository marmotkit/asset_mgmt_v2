const axios = require('axios');

// 設置 API 客戶端
const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api', // 本地開發環境
    headers: {
        'Content-Type': 'application/json',
    },
});

async function testJournalAPI() {
    console.log('🔍 開始測試日記帳 API...\n');

    try {
        // 1. 測試取得日記帳列表
        console.log('1. 測試取得日記帳列表...');
        const listResponse = await apiClient.get('/accounting/journal');
        console.log('✅ 日記帳列表:', listResponse.data);
        console.log(`   共 ${listResponse.data.length} 筆記錄\n`);

        // 2. 測試取得會計科目列表
        console.log('2. 測試取得會計科目列表...');
        const accountsResponse = await apiClient.get('/accounting/accounts');
        console.log('✅ 會計科目列表:', accountsResponse.data);
        console.log(`   共 ${accountsResponse.data.length} 個科目\n`);

        // 3. 測試建立新日記帳記錄
        console.log('3. 測試建立新日記帳記錄...');
        const testJournalData = {
            journal_date: '2025-01-20',
            journal_number: 'JRN-2025-001',
            reference_number: 'REF-001',
            description: '測試日記帳記錄',
            debit_account_id: accountsResponse.data[0]?.id, // 使用第一個科目作為借方
            credit_account_id: accountsResponse.data[1]?.id, // 使用第二個科目作為貸方
            amount: 1000.00,
            category_id: null,
            created_by: '測試用戶'
        };

        console.log('   要建立的資料:', testJournalData);

        const createResponse = await apiClient.post('/accounting/journal', testJournalData);
        console.log('✅ 建立成功:', createResponse.data);

        // 4. 再次取得日記帳列表確認新增成功
        console.log('\n4. 再次取得日記帳列表確認新增成功...');
        const updatedListResponse = await apiClient.get('/accounting/journal');
        console.log('✅ 更新後的日記帳列表:', updatedListResponse.data);
        console.log(`   共 ${updatedListResponse.data.length} 筆記錄\n`);

        // 5. 測試取得單一日記帳記錄
        if (createResponse.data.id) {
            console.log('5. 測試取得單一日記帳記錄...');
            const singleResponse = await apiClient.get(`/accounting/journal/${createResponse.data.id}`);
            console.log('✅ 單一日記帳記錄:', singleResponse.data);
        }

        console.log('\n🎉 所有測試完成！');

    } catch (error) {
        console.error('❌ 測試失敗:', error.response?.data || error.message);

        if (error.response) {
            console.error('   狀態碼:', error.response.status);
            console.error('   錯誤詳情:', error.response.data);
        }
    }
}

// 執行測試
testJournalAPI(); 