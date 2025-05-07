// 強制清除所有資料的腳本 - 用於解決硬編碼資料問題

(function () {
    console.log('===== 開始清除所有租金收款和會員分潤資料 =====');

    // 1. 先檢查現有資料
    function checkData() {
        console.log('檢查現有資料...');

        // 檢查租金收款資料
        try {
            const rentalPayments = JSON.parse(localStorage.getItem('rentalPayments')) || [];
            console.log(`發現 ${rentalPayments.length} 筆租金收款資料`);

            // 顯示年度統計
            const yearStats = {};
            rentalPayments.forEach(payment => {
                if (!yearStats[payment.year]) {
                    yearStats[payment.year] = { count: 0, amount: 0 };
                }
                yearStats[payment.year].count++;
                yearStats[payment.year].amount += Number(payment.amount);
            });

            Object.keys(yearStats).forEach(year => {
                console.log(`- ${year}年: ${yearStats[year].count}筆, 總金額: $${yearStats[year].amount}`);
            });
        } catch (e) {
            console.error('檢查租金收款資料時出錯:', e);
        }

        // 檢查會員分潤資料
        try {
            const memberProfits = JSON.parse(localStorage.getItem('memberProfits')) || [];
            console.log(`發現 ${memberProfits.length} 筆會員分潤資料`);
        } catch (e) {
            console.error('檢查會員分潤資料時出錯:', e);
        }
    }

    // 2. 清除所有資料
    function clearAllData() {
        console.log('正在清除所有資料...');

        // 清除租金收款資料
        try {
            localStorage.setItem('rentalPayments', JSON.stringify([]));
            console.log('✅ 已清除所有租金收款資料');
        } catch (e) {
            console.error('清除租金收款資料時出錯:', e);
        }

        // 清除會員分潤資料
        try {
            localStorage.setItem('memberProfits', JSON.stringify([]));
            console.log('✅ 已清除所有會員分潤資料');
        } catch (e) {
            console.error('清除會員分潤資料時出錯:', e);
        }
    }

    // 先檢查再清除
    checkData();
    clearAllData();
    console.log('💡 清除完成! 請重新整理頁面以查看效果。');
    console.log('⚠️ 注意: 如果看到資料仍然存在，可能是硬編碼在程式碼中，請檢查最新版的前端代碼是否已部署。');
    console.log('===== 完成 =====');
})(); 