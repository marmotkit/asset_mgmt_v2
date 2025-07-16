const axios = require('axios');

// 測試生產環境 API
const PRODUCTION_API_URL = 'https://asset-mgmt-api-clean.onrender.com/api';

async function testProductionAPI() {
    console.log('🔍 測試生產環境 API...\n');
    console.log('📡 API 地址:', PRODUCTION_API_URL);

    try {
        // 1. 測試會計科目 API
        console.log('\n1. 測試會計科目 API...');
        const accountsResponse = await axios.get(`${PRODUCTION_API_URL}/accounting/accounts`, { timeout: 10000 });
        console.log('✅ 會計科目 API 成功');
        console.log(`   共 ${accountsResponse.data.length} 個科目`);

        if (accountsResponse.data.length > 0) {
            console.log('   範例科目:');
            accountsResponse.data.slice(0, 5).forEach(account => {
                console.log(`     ${account.account_code} - ${account.account_name}`);
            });
        }

        // 2. 測試日記帳 API
        console.log('\n2. 測試日記帳 API...');
        const journalResponse = await axios.get(`${PRODUCTION_API_URL}/accounting/journal`, { timeout: 10000 });
        console.log('✅ 日記帳 API 成功');
        console.log(`   共 ${journalResponse.data.journals?.length || 0} 筆記錄`);

        if (journalResponse.data.journals && journalResponse.data.journals.length > 0) {
            console.log('   範例記錄:');
            journalResponse.data.journals.slice(0, 3).forEach(journal => {
                console.log(`     ${journal.journal_number} - ${journal.description} - $${journal.amount}`);
            });
        } else {
            console.log('   ⚠️  沒有日記帳記錄');
        }

        // 3. 測試交易類別 API
        console.log('\n3. 測試交易類別 API...');
        const categoriesResponse = await axios.get(`${PRODUCTION_API_URL}/accounting/categories`, { timeout: 10000 });
        console.log('✅ 交易類別 API 成功');
        console.log(`   共 ${categoriesResponse.data.length} 個類別`);

        // 4. 測試建立新日記帳記錄
        if (accountsResponse.data.length >= 2) {
            console.log('\n4. 測試建立新日記帳記錄...');
            const testData = {
                journal_date: '2025-01-20',
                journal_number: 'JRN-TEST-001',
                reference_number: 'REF-TEST',
                description: '測試日記帳記錄',
                debit_account_id: accountsResponse.data[0].id,
                credit_account_id: accountsResponse.data[1].id,
                amount: 1000.00,
                category_id: null,
                created_by: '測試用戶'
            };

            console.log('   要建立的資料:', testData);

            const createResponse = await axios.post(`${PRODUCTION_API_URL}/accounting/journal`, testData, { timeout: 10000 });
            console.log('✅ 建立日記帳記錄成功:', createResponse.data);

            // 5. 再次檢查日記帳記錄
            console.log('\n5. 再次檢查日記帳記錄...');
            const updatedJournalResponse = await axios.get(`${PRODUCTION_API_URL}/accounting/journal`, { timeout: 10000 });
            console.log(`   更新後共 ${updatedJournalResponse.data.journals?.length || 0} 筆記錄`);
        }

        console.log('\n🎉 所有 API 測試完成！');

    } catch (error) {
        console.error('❌ API 測試失敗:', error.message);

        if (error.response) {
            console.error('   狀態碼:', error.response.status);
            console.error('   錯誤詳情:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('   連接超時');
        } else if (error.code === 'ENOTFOUND') {
            console.error('   無法找到主機');
        }
    }
}

// 執行測試
testProductionAPI(); 