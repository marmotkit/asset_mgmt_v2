const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api-clean.onrender.com';

async function checkAndFixOverdueStatus() {
    try {
        console.log('【檢查和修正逾期狀態】開始...');

        // 1. 先登入獲取認證令牌
        console.log('\n=== 1. 登入獲取認證令牌 ===');
        let token;
        try {
            const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                username: 'admin',
                password: 'admin123'
            });
            token = loginResponse.data.token;
            console.log('✓ 登入成功，獲取認證令牌');
        } catch (error) {
            console.log('✗ 登入失敗:', error.response?.data || error.message);
            return;
        }

        // 2. 檢查會費記錄的狀態分布
        console.log('\n=== 2. 檢查會費記錄狀態分布 ===');
        try {
            const feesResponse = await axios.get(`${API_BASE_URL}/api/fees`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const statusCount = {};
            feesResponse.data.forEach(fee => {
                statusCount[fee.status] = (statusCount[fee.status] || 0) + 1;
            });
            console.log('會費狀態分布:');
            console.table(statusCount);

            // 檢查是否有逾期記錄
            const overdueFees = feesResponse.data.filter(fee =>
                fee.status === 'overdue' || fee.status === '逾期'
            );
            console.log(`找到 ${overdueFees.length} 筆逾期會費記錄`);

            if (overdueFees.length > 0) {
                console.log('逾期會費記錄詳情:');
                console.table(overdueFees.map(fee => ({
                    id: fee.id,
                    memberName: fee.member_name,
                    amount: fee.amount,
                    dueDate: fee.due_date,
                    status: fee.status
                })));
            }
        } catch (error) {
            console.log('✗ 檢查會費記錄失敗:', error.response?.data || error.message);
        }

        // 3. 檢查租金記錄的狀態分布
        console.log('\n=== 3. 檢查租金記錄狀態分布 ===');
        try {
            const rentalResponse = await axios.get(`${API_BASE_URL}/api/rental-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rentalStatusCount = {};
            rentalResponse.data.forEach(rental => {
                rentalStatusCount[rental.status] = (rentalStatusCount[rental.status] || 0) + 1;
            });
            console.log('租金狀態分布:');
            console.table(rentalStatusCount);

            // 檢查是否有逾期記錄
            const overdueRentals = rentalResponse.data.filter(rental =>
                rental.status === 'late' || rental.status === '逾期'
            );
            console.log(`找到 ${overdueRentals.length} 筆逾期租金記錄`);

            if (overdueRentals.length > 0) {
                console.log('逾期租金記錄詳情:');
                console.table(overdueRentals.map(rental => ({
                    id: rental.id,
                    renterName: rental.renterName,
                    amount: rental.amount,
                    year: rental.year,
                    month: rental.month,
                    status: rental.status
                })));
            }
        } catch (error) {
            console.log('✗ 檢查租金記錄失敗:', error.response?.data || error.message);
        }

        // 4. 測試風險管理 API
        console.log('\n=== 4. 測試風險管理 API ===');
        try {
            const memberOverdueResponse = await axios.get(`${API_BASE_URL}/api/risk-management/member-overdue-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✓ 會員逾期繳款記錄 API 正常，找到 ${memberOverdueResponse.data.length} 筆記錄`);
            if (memberOverdueResponse.data.length > 0) {
                console.table(memberOverdueResponse.data);
            }
        } catch (error) {
            console.log('✗ 會員逾期繳款記錄 API 錯誤:', error.response?.data || error.message);
        }

        try {
            const rentalOverdueResponse = await axios.get(`${API_BASE_URL}/api/risk-management/rental-overdue-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✓ 客戶租金逾期繳款記錄 API 正常，找到 ${rentalOverdueResponse.data.length} 筆記錄`);
            if (rentalOverdueResponse.data.length > 0) {
                console.table(rentalOverdueResponse.data);
            }
        } catch (error) {
            console.log('✗ 客戶租金逾期繳款記錄 API 錯誤:', error.response?.data || error.message);
        }

        console.log('\n【檢查完成】');
    } catch (error) {
        console.error('【檢查失敗】:', error.message);
    }
}

checkAndFixOverdueStatus(); 