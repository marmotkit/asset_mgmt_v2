const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api-clean.onrender.com';

async function testMemberServicesAPI() {
    console.log('=== 測試會員服務 API ===\n');

    let token = null;

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

        // 2. 登入取得 token
        console.log('\n2. 登入取得 token...');
        try {
            console.log('嘗試登入...');
            const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            token = loginResponse.data.token;
            console.log('✓ 登入成功，取得 token');
        } catch (error) {
            console.log('✗ 登入失敗:', error.response?.data || error.message);
            console.log('錯誤詳情:', error.response?.status, error.response?.statusText);
            console.log('請求 URL:', `${API_BASE_URL}/api/auth/login`);
            return;
        }

        // 3. 測試年度活動 API
        console.log('\n3. 測試年度活動 API...');
        try {
            const activitiesResponse = await axios.get(`${API_BASE_URL}/api/annual-activities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✓ 年度活動 API 正常，找到 ${activitiesResponse.data.length} 個活動`);
            if (activitiesResponse.data.length > 0) {
                activitiesResponse.data.forEach(activity => {
                    console.log(`  - ${activity.title} (${activity.year}年) - 狀態: ${activity.status}`);
                });
            }
        } catch (error) {
            console.log('✗ 年度活動 API 錯誤:', error.response?.data || error.message);
        }

        // 4. 測試會員關懷 API
        console.log('\n4. 測試會員關懷 API...');
        try {
            const caresResponse = await axios.get(`${API_BASE_URL}/api/member-cares`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✓ 會員關懷 API 正常，找到 ${caresResponse.data.length} 個關懷記錄`);
            if (caresResponse.data.length > 0) {
                caresResponse.data.forEach(care => {
                    console.log(`  - ${care.title} (${care.type}) - 狀態: ${care.status}`);
                });
            }
        } catch (error) {
            console.log('✗ 會員關懷 API 錯誤:', error.response?.data || error.message);
        }

        // 5. 測試建立年度活動
        console.log('\n5. 測試建立年度活動...');
        try {
            const newActivity = {
                title: 'API 測試活動',
                description: '這是一個透過 API 建立的測試活動',
                startDate: '2025-12-25',
                endDate: '2025-12-25',
                location: '測試地點',
                capacity: 20,
                registrationDeadline: '2025-12-20',
                status: 'planning',
                year: 2025
            };

            const createActivityResponse = await axios.post(`${API_BASE_URL}/api/annual-activities`, newActivity, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✓ 成功建立年度活動:', createActivityResponse.data.title);
        } catch (error) {
            console.log('✗ 建立年度活動失敗:', error.response?.data || error.message);
        }

        // 6. 測試建立會員關懷記錄
        console.log('\n6. 測試建立會員關懷記錄...');
        try {
            // 先取得使用者列表
            const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (usersResponse.data.length > 0) {
                const userId = usersResponse.data[0].id;

                const newCare = {
                    memberId: userId,
                    type: 'birthday',
                    title: 'API 測試關懷',
                    description: '這是一個透過 API 建立的測試關懷記錄',
                    date: '2025-12-25',
                    status: 'planned'
                };

                const createCareResponse = await axios.post(`${API_BASE_URL}/api/member-cares`, newCare, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('✓ 成功建立會員關懷記錄:', createCareResponse.data.title);
            } else {
                console.log('✗ 沒有找到使用者，無法建立關懷記錄');
            }
        } catch (error) {
            console.log('✗ 建立會員關懷記錄失敗:', error.response?.data || error.message);
        }

        // 7. 再次檢查資料
        console.log('\n7. 再次檢查資料...');
        try {
            const activitiesResponse = await axios.get(`${API_BASE_URL}/api/annual-activities`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✓ 年度活動總數: ${activitiesResponse.data.length}`);

            const caresResponse = await axios.get(`${API_BASE_URL}/api/member-cares`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✓ 會員關懷記錄總數: ${caresResponse.data.length}`);
        } catch (error) {
            console.log('✗ 檢查資料失敗:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('✗ 測試失敗:', error.message);
    }
}

testMemberServicesAPI(); 