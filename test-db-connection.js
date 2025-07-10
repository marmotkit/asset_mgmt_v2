const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api.onrender.com';

async function testApiEndpoints() {
    console.log('=== 測試資產管理系統 API ===\n');

    try {
        // 1. 測試基本連接
        console.log('1. 測試基本連接...');
        const healthResponse = await axios.get(`${API_BASE_URL}/`);
        console.log('✓ 基本連接成功:', healthResponse.data);

        // 2. 測試用戶 API
        console.log('\n2. 測試用戶 API...');
        try {
            const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
            console.log('✓ 用戶 API 正常，用戶數量:', usersResponse.data.length);
        } catch (error) {
            console.log('✗ 用戶 API 錯誤:', error.response?.data || error.message);
        }

        // 3. 測試公司 API
        console.log('\n3. 測試公司 API...');
        try {
            const companiesResponse = await axios.get(`${API_BASE_URL}/api/companies`);
            console.log('✓ 公司 API 正常，公司數量:', companiesResponse.data.length);
        } catch (error) {
            console.log('✗ 公司 API 錯誤:', error.response?.data || error.message);
        }

        // 4. 測試投資 API
        console.log('\n4. 測試投資 API...');
        try {
            const investmentsResponse = await axios.get(`${API_BASE_URL}/api/investments`);
            console.log('✓ 投資 API 正常，投資項目數量:', investmentsResponse.data.length);
        } catch (error) {
            console.log('✗ 投資 API 錯誤:', error.response?.data || error.message);
        }

        // 5. 測試認證 API
        console.log('\n5. 測試認證 API...');
        try {
            const authResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            console.log('✓ 認證 API 正常');
        } catch (error) {
            console.log('✗ 認證 API 錯誤:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('✗ API 連接失敗:', error.message);
    }
}

testApiEndpoints(); 