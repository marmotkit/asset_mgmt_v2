// 檢查 localStorage 中的數據
function checkLocalStorage() {
    console.log('======= 檢查本地存儲 =======');

    // 檢查租金收款數據
    try {
        const rentalPayments = JSON.parse(localStorage.getItem('rentalPayments')) || [];
        console.log(`找到 ${rentalPayments.length} 筆租金收款記錄`);

        // 按年份分組
        const paymentsByYear = {};
        rentalPayments.forEach(payment => {
            if (!paymentsByYear[payment.year]) {
                paymentsByYear[payment.year] = [];
            }
            paymentsByYear[payment.year].push(payment);
        });

        // 顯示每年統計
        Object.keys(paymentsByYear).forEach(year => {
            const yearPayments = paymentsByYear[year];
            const totalAmount = yearPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            console.log(`${year}年: ${yearPayments.length}筆, 總金額: $${totalAmount}`);
        });
    } catch (e) {
        console.error('解析租金收款數據出錯:', e);
    }

    // 檢查會員分潤數據
    try {
        const memberProfits = JSON.parse(localStorage.getItem('memberProfits')) || [];
        console.log(`找到 ${memberProfits.length} 筆會員分潤記錄`);

        // 按年份分組
        const profitsByYear = {};
        memberProfits.forEach(profit => {
            if (!profitsByYear[profit.year]) {
                profitsByYear[profit.year] = [];
            }
            profitsByYear[profit.year].push(profit);
        });

        // 顯示每年統計
        Object.keys(profitsByYear).forEach(year => {
            const yearProfits = profitsByYear[year];
            const totalAmount = yearProfits.reduce((sum, p) => sum + Number(p.amount), 0);
            console.log(`${year}年: ${yearProfits.length}筆分潤, 總金額: $${totalAmount}`);
        });
    } catch (e) {
        console.error('解析會員分潤數據出錯:', e);
    }

    console.log('======= 檢查完成 =======');
}

// 手動清除 2025 年數據
function clearYear2025() {
    console.log('======= 開始手動清除 2025 年數據 =======');

    // 清除租金收款記錄
    try {
        const storedPayments = localStorage.getItem('rentalPayments');
        if (storedPayments) {
            const allPayments = JSON.parse(storedPayments);
            const filteredPayments = allPayments.filter(payment => payment.year !== 2025);
            console.log(`租金收款：從 ${allPayments.length} 筆過濾到 ${filteredPayments.length} 筆`);
            localStorage.setItem('rentalPayments', JSON.stringify(filteredPayments));
        }
    } catch (e) {
        console.error('清除租金收款時出錯:', e);
    }

    // 清除會員分潤記錄
    try {
        const storedProfits = localStorage.getItem('memberProfits');
        if (storedProfits) {
            const allProfits = JSON.parse(storedProfits);
            const filteredProfits = allProfits.filter(profit => profit.year !== 2025);
            console.log(`會員分潤：從 ${allProfits.length} 筆過濾到 ${filteredProfits.length} 筆`);
            localStorage.setItem('memberProfits', JSON.stringify(filteredProfits));
        }
    } catch (e) {
        console.error('清除會員分潤時出錯:', e);
    }

    console.log('======= 清除完成 =======');
    console.log('請重新載入頁面以查看效果');
}

// 檢查本地存儲
checkLocalStorage();

// 如果需要清除數據，請取消以下行的註釋
// clearYear2025(); 