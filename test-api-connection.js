const axios = require('axios');

async function testApiConnection() {
    const apiUrl = 'https://asset-mgmt-api.onrender.com';

    try {
        console.log('測試 API 連接...');
        console.log(`API URL: ${apiUrl}`);

        // 測試基本連接
        const response = await axios.get(`${apiUrl}/`);
        console.log('✓ API 服務正常運行');
        console.log('回應:', response.data);

        // 測試資料庫連接
        try {
            const dbResponse = await axios.get(`${apiUrl}/api/users`);
            console.log('✓ 資料庫連接正常');
            console.log('用戶數量:', dbResponse.data.length);
        } catch (dbError) {
            console.log('✗ 資料庫連接有問題');
            console.log('錯誤:', dbError.response?.data || dbError.message);
        }

    } catch (error) {
        console.log('✗ API 服務無法連接');
        console.log('錯誤:', error.response?.data || error.message);
    }
}

testApiConnection(); 