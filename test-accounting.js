const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAccountingAPI() {
    console.log('開始測試賬務管理 API...\n');

    try {
        // 1. 測試取得會計科目
        console.log('1. 測試取得會計科目...');
        const accountsResponse = await axios.get(`${BASE_URL}/accounting/accounts`);
        console.log(`✓ 取得 ${accountsResponse.data.length} 個會計科目`);
        console.log('科目範例:', accountsResponse.data.slice(0, 3).map(a => `${a.account_code} - ${a.account_name}`));
        console.log('');

        // 2. 測試取得交易類別
        console.log('2. 測試取得交易類別...');
        const categoriesResponse = await axios.get(`${BASE_URL}/accounting/categories`);
        console.log(`✓ 取得 ${categoriesResponse.data.length} 個交易類別`);
        console.log('類別範例:', categoriesResponse.data.slice(0, 3).map(c => `${c.category_code} - ${c.category_name}`));
        console.log('');

        // 3. 測試建立日記帳
        console.log('3. 測試建立日記帳...');
        const journalData = {
            journal_date: '2024-01-15',
            journal_number: 'J001',
            reference_number: 'REF001',
            description: '測試日記帳分錄',
            debit_account_id: accountsResponse.data.find(a => a.account_code === '1000').id,
            credit_account_id: accountsResponse.data.find(a => a.account_code === '4000').id,
            amount: 10000,
            category_id: categoriesResponse.data.find(c => c.category_code === 'REV001').id,
            created_by: 'admin'
        };

        const journalResponse = await axios.post(`${BASE_URL}/accounting/journal`, journalData);
        console.log('✓ 日記帳建立成功:', journalResponse.data.journal_number);
        console.log('');

        // 4. 測試取得日記帳列表
        console.log('4. 測試取得日記帳列表...');
        const journalListResponse = await axios.get(`${BASE_URL}/accounting/journal`);
        console.log(`✓ 取得 ${journalListResponse.data.journals.length} 筆日記帳記錄`);
        console.log('');

        // 5. 測試建立應收帳款
        console.log('5. 測試建立應收帳款...');
        const receivableData = {
            customer_id: 'CUST001',
            customer_name: '測試客戶',
            invoice_number: 'INV001',
            amount: 5000,
            due_date: '2024-02-15',
            description: '測試應收帳款'
        };

        const receivableResponse = await axios.post(`${BASE_URL}/accounting/receivables`, receivableData);
        console.log('✓ 應收帳款建立成功:', receivableResponse.data.invoice_number);
        console.log('');

        // 6. 測試建立應付帳款
        console.log('6. 測試建立應付帳款...');
        const payableData = {
            supplier_id: 'SUPP001',
            supplier_name: '測試供應商',
            invoice_number: 'SUPP_INV001',
            amount: 3000,
            due_date: '2024-02-20',
            description: '測試應付帳款'
        };

        const payableResponse = await axios.post(`${BASE_URL}/accounting/payables`, payableData);
        console.log('✓ 應付帳款建立成功:', payableResponse.data.invoice_number);
        console.log('');

        // 7. 測試取得科目餘額
        console.log('7. 測試取得科目餘額...');
        const balanceResponse = await axios.get(`${BASE_URL}/accounting/journal/accounts/balance`);
        console.log(`✓ 取得 ${balanceResponse.data.length} 個科目餘額`);
        console.log('餘額範例:', balanceResponse.data.slice(0, 3).map(b => `${b.account_code} - ${b.account_name}: ${b.balance}`));
        console.log('');

        // 8. 測試取得統計資料
        console.log('8. 測試取得統計資料...');
        const statsResponse = await axios.get(`${BASE_URL}/accounting/journal/stats/summary`);
        console.log('✓ 日記帳統計:', statsResponse.data);
        console.log('');

        console.log('🎉 所有賬務管理 API 測試通過！');

    } catch (error) {
        console.error('❌ 測試失敗:', error.response?.data || error.message);
    }
}

// 執行測試
testAccountingAPI(); 