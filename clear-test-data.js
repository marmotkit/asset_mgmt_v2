const axios = require('axios');

// 設置 API 客戶端
const apiClient = axios.create({
    baseURL: 'https://asset-mgmt-api-clean.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const testKeywords = ['ABC', 'XYZ', '顧問', '維護', '測試', 'TEST'];

function isTestRecord(obj, fields) {
    return fields.some(field =>
        testKeywords.some(keyword =>
            (obj[field] && typeof obj[field] === 'string' && obj[field].toString().includes(keyword))
        )
    );
}

async function clearTestData() {
    console.log('🧹 開始清理所有測試資料...\n');
    try {
        // 1. 應收帳款
        console.log('1. 取得應收帳款...');
        const arRes = await apiClient.get('/accounting/receivables');
        console.log('應收帳款原始資料:', JSON.stringify(arRes.data, null, 2));

        // 2. 應付帳款
        console.log('2. 取得應付帳款...');
        const apRes = await apiClient.get('/accounting/payables');
        console.log('應付帳款原始資料:', JSON.stringify(apRes.data, null, 2));

        // 3. 月結
        console.log('3. 取得月結...');
        const monthRes = await apiClient.get('/accounting/monthly-closings');
        console.log('月結原始資料:', JSON.stringify(monthRes.data, null, 2));

        // 4. 日記帳
        console.log('4. 取得日記帳...');
        const journalRes = await apiClient.get('/accounting/journal');
        console.log('日記帳原始資料:', JSON.stringify(journalRes.data, null, 2));

        console.log('\n（暫不刪除，僅列印資料結構，請將結果提供給助理）');
    } catch (error) {
        console.error('❌ 取得資料時發生錯誤:', error.response?.data || error.message);
    }
}

clearTestData(); 