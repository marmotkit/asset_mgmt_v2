const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api.onrender.com';

async function testDatabaseData() {
    console.log('=== 測試資料庫資料 ===\n');

    try {
        // 1. 測試用戶資料
        console.log('1. 檢查用戶資料...');
        const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
        const users = usersResponse.data;

        console.log(`找到 ${users.length} 個用戶:`);
        users.forEach(user => {
            console.log(`  - ${user.name} (${user.username}) - 角色: ${user.role}`);
        });

        // 2. 測試公司資料
        console.log('\n2. 檢查公司資料...');
        const companiesResponse = await axios.get(`${API_BASE_URL}/api/companies`);
        const companies = companiesResponse.data;

        console.log(`找到 ${companies.length} 個公司:`);
        companies.forEach(company => {
            console.log(`  - ${company.name} (${company.companyNo})`);
        });

        // 3. 測試投資資料
        console.log('\n3. 檢查投資資料...');
        const investmentsResponse = await axios.get(`${API_BASE_URL}/api/investments`);
        const investments = investmentsResponse.data;

        console.log(`找到 ${investments.length} 個投資項目`);

        // 4. 測試登入功能
        console.log('\n4. 測試登入功能...');
        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            console.log('✓ 管理者登入成功');
            console.log('Token:', loginResponse.data.token ? '已取得' : '未取得');
        } catch (error) {
            console.log('✗ 登入失敗:', error.response?.data || error.message);
        }

        // 5. 測試建立新資料
        console.log('\n5. 測試建立新資料...');
        try {
            const newCompanyResponse = await axios.post(`${API_BASE_URL}/api/companies`, {
                companyNo: 'TEST001',
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

testDatabaseData(); 