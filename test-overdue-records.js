const axios = require('axios');

const API_BASE_URL = 'https://asset-mgmt-api-clean.onrender.com';

async function testOverdueRecords() {
    try {
        console.log('【測試逾期記錄】開始檢查 API...');

        // 檢查會員逾期繳款記錄
        console.log('\n=== 檢查會員逾期繳款記錄 ===');
        try {
            const memberOverdueResponse = await axios.get(`${API_BASE_URL}/api/risk-management/member-overdue-payments`);
            console.log(`找到 ${memberOverdueResponse.data.length} 筆會員逾期繳款記錄:`);
            console.table(memberOverdueResponse.data);
        } catch (error) {
            console.log('✗ 會員逾期繳款記錄 API 錯誤:', error.response?.data || error.message);
        }

        // 檢查客戶租金逾期繳款記錄
        console.log('\n=== 檢查客戶租金逾期繳款記錄 ===');
        try {
            const rentalOverdueResponse = await axios.get(`${API_BASE_URL}/api/risk-management/rental-overdue-payments`);
            console.log(`找到 ${rentalOverdueResponse.data.length} 筆客戶租金逾期繳款記錄:`);
            console.table(rentalOverdueResponse.data);
        } catch (error) {
            console.log('✗ 客戶租金逾期繳款記錄 API 錯誤:', error.response?.data || error.message);
        }

        // 檢查所有會費記錄
        console.log('\n=== 檢查所有會費記錄 ===');
        try {
            const feesResponse = await axios.get(`${API_BASE_URL}/api/fees`);
            console.log(`總共有 ${feesResponse.data.length} 筆會費記錄`);

            // 統計狀態分布
            const statusCount = {};
            feesResponse.data.forEach(fee => {
                statusCount[fee.status] = (statusCount[fee.status] || 0) + 1;
            });
            console.log('會費狀態分布:');
            console.table(statusCount);
        } catch (error) {
            console.log('✗ 會費記錄 API 錯誤:', error.response?.data || error.message);
        }

        // 檢查所有租金記錄
        console.log('\n=== 檢查所有租金記錄 ===');
        try {
            const rentalResponse = await axios.get(`${API_BASE_URL}/api/rental-payments`);
            console.log(`總共有 ${rentalResponse.data.length} 筆租金記錄`);

            // 統計狀態分布
            const rentalStatusCount = {};
            rentalResponse.data.forEach(rental => {
                rentalStatusCount[rental.status] = (rentalStatusCount[rental.status] || 0) + 1;
            });
            console.log('租金狀態分布:');
            console.table(rentalStatusCount);
        } catch (error) {
            console.log('✗ 租金記錄 API 錯誤:', error.response?.data || error.message);
        }

        console.log('\n【測試完成】');
    } catch (error) {
        console.error('【測試失敗】:', error.message);
    }
}

testOverdueRecords(); 