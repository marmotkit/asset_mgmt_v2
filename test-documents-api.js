const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api-clean.onrender.com/api';

// 測試用的 token（需要先登入獲取）
const TEST_TOKEN = 'your-test-token-here';

async function testDocumentsAPI() {
    console.log('開始測試 Documents API...\n');

    const headers = {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // 1. 測試獲取所有文件
        console.log('1. 測試獲取所有文件...');
        const getAllResponse = await axios.get(`${API_BASE_URL}/documents`, { headers });
        console.log('獲取所有文件成功:', getAllResponse.data);
        console.log('文件數量:', getAllResponse.data.length);

        // 2. 測試創建發票
        console.log('\n2. 測試創建發票...');
        const newInvoice = {
            type: '二聯式',
            memberId: 'test-member-id',
            memberName: '測試會員',
            paymentId: 'test-payment-id',
            invoiceNumber: 'AB-00000001',
            amount: 1000,
            date: '2025-01-15'
        };

        const createResponse = await axios.post(`${API_BASE_URL}/documents`, newInvoice, { headers });
        console.log('創建發票成功:', createResponse.data);

        const createdDocId = createResponse.data.id;

        // 3. 測試獲取單一文件
        console.log('\n3. 測試獲取單一文件...');
        const getOneResponse = await axios.get(`${API_BASE_URL}/documents/${createdDocId}`, { headers });
        console.log('獲取單一文件成功:', getOneResponse.data);

        // 4. 測試更新文件
        console.log('\n4. 測試更新文件...');
        const updateData = {
            amount: 1500,
            date: '2025-01-16'
        };

        const updateResponse = await axios.put(`${API_BASE_URL}/documents/${createdDocId}`, updateData, { headers });
        console.log('更新文件成功:', updateResponse.data);

        // 5. 測試按會員 ID 查詢
        console.log('\n5. 測試按會員 ID 查詢...');
        const getByMemberResponse = await axios.get(`${API_BASE_URL}/documents?memberId=test-member-id`, { headers });
        console.log('按會員 ID 查詢成功:', getByMemberResponse.data);

        // 6. 測試刪除文件
        console.log('\n6. 測試刪除文件...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/documents/${createdDocId}`, { headers });
        console.log('刪除文件成功:', deleteResponse.data);

        console.log('\n所有測試完成！');

    } catch (error) {
        console.error('測試失敗:', error.response?.data || error.message);
    }
}

// 如果沒有提供 token，提示用戶
if (TEST_TOKEN === 'your-test-token-here') {
    console.log('請先設定有效的測試 token');
    console.log('1. 登入系統獲取 token');
    console.log('2. 將 token 設定到 TEST_TOKEN 變數中');
    console.log('3. 重新執行測試');
} else {
    testDocumentsAPI();
} 