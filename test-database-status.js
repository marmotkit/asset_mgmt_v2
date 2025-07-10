const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api.onrender.com';

async function testDatabaseStatus() {
    console.log('=== 測試資料庫狀態 ===\n');

    try {
        // 1. 測試基本連接
        console.log('1. 測試基本連接...');
        try {
            const healthResponse = await axios.get(`${API_BASE_URL}/`);
            console.log('✓ 基本連接成功:', healthResponse.data);
        } catch (error) {
            console.log('✗ 基本連接失敗:', error.message);
            return;
        }

        // 2. 測試用戶 API
        console.log('\n2. 測試用戶 API...');
        try {
            const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
            const users = usersResponse.data;
            console.log(`✓ 用戶 API 正常，找到 ${users.length} 個用戶:`);
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.username}) - 角色: ${user.role}`);
            });
        } catch (error) {
            console.log('✗ 用戶 API 錯誤:', error.response?.data || error.message);
        }

        // 3. 測試公司 API
        console.log('\n3. 測試公司 API...');
        try {
            const companiesResponse = await axios.get(`${API_BASE_URL}/api/companies`);
            const companies = companiesResponse.data;
            console.log(`✓ 公司 API 正常，找到 ${companies.length} 個公司:`);
            companies.forEach(company => {
                console.log(`  - ${company.name} (${company.companyNo})`);
            });
        } catch (error) {
            console.log('✗ 公司 API 錯誤:', error.response?.data || error.message);
        }

        // 4. 測試投資 API
        console.log('\n4. 測試投資 API...');
        try {
            const investmentsResponse = await axios.get(`${API_BASE_URL}/api/investments`);
            const investments = investmentsResponse.data;
            console.log(`✓ 投資 API 正常，找到 ${investments.length} 個投資項目`);
        } catch (error) {
            console.log('✗ 投資 API 錯誤:', error.response?.data || error.message);
        }

        // 5. 測試登入功能
        console.log('\n5. 測試登入功能...');
        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            console.log('✓ 管理者登入成功');
            if (loginResponse.data.token) {
                console.log('✓ Token 已取得');
            }
        } catch (error) {
            console.log('✗ 登入失敗:', error.response?.data || error.message);
        }

        // 6. 測試建立新資料
        console.log('\n6. 測試建立新資料...');
        try {
            const newCompanyResponse = await axios.post(`${API_BASE_URL}/api/companies`, {
                companyNo: 'TEST' + Date.now(),
                name: '測試新增公司',
                address: '測試地址',
                phone: '02-9999-9999'
            });
            console.log('✓ 成功建立新公司:', newCompanyResponse.data.name);
        } catch (error) {
            console.log('✗ 建立公司失敗:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('✗ 測試失敗:', error.message);
    }
}

testDatabaseStatus(); 