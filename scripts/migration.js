const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 加載數據庫連接
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: console.log
});

// 確保數據目錄存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    console.log('錯誤：數據目錄不存在！請先運行 export-data.js 導出數據。');
    process.exit(1);
}

// 遷移執行函數
async function runMigration() {
    try {
        // 測試數據庫連接
        await sequelize.authenticate();
        console.log('數據庫連接成功！');

        // 模型定義
        console.log('加載數據庫模型...');
        const models = require('../dist/models');

        // 同步數據庫架構
        console.log('同步數據庫架構...');
        await sequelize.sync({ force: true });
        console.log('數據庫架構同步完成！');

        // 讀取並遷移數據
        console.log('開始遷移數據...');

        // 1. 遷移用戶數據
        try {
            if (fs.existsSync(path.join(dataDir, 'users.json'))) {
                const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
                console.log(`找到 ${usersData.length} 個用戶記錄`);

                // 對用戶數據進行處理（例如加密密碼）
                for (const user of usersData) {
                    // 創建用戶記錄
                    await models.User.create(user);
                }
                console.log('✓ 用戶數據遷移完成');
            } else {
                console.log('! 找不到用戶數據文件');
            }
        } catch (error) {
            console.error('× 用戶數據遷移失敗:', error);
        }

        // 2. 遷移公司數據
        try {
            if (fs.existsSync(path.join(dataDir, 'companies.json'))) {
                const companiesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'companies.json'), 'utf8'));
                console.log(`找到 ${companiesData.length} 個公司記錄`);

                for (const company of companiesData) {
                    // 確保 contact 是字符串
                    if (typeof company.contact === 'object') {
                        company.contact = JSON.stringify(company.contact);
                    }
                    await models.Company.create(company);
                }
                console.log('✓ 公司數據遷移完成');
            } else {
                console.log('! 找不到公司數據文件');
            }
        } catch (error) {
            console.error('× 公司數據遷移失敗:', error);
        }

        // 3. 遷移投資項目數據
        try {
            if (fs.existsSync(path.join(dataDir, 'investments.json'))) {
                const investmentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'investments.json'), 'utf8'));
                console.log(`找到 ${investmentsData.length} 個投資項目記錄`);

                for (const investment of investmentsData) {
                    await models.Investment.create(investment);
                }
                console.log('✓ 投資項目數據遷移完成');
            } else {
                console.log('! 找不到投資項目數據文件');
            }
        } catch (error) {
            console.error('× 投資項目數據遷移失敗:', error);
        }

        // 4. 遷移租賃標準數據
        try {
            if (fs.existsSync(path.join(dataDir, 'rentalStandards.json'))) {
                const standardsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'rentalStandards.json'), 'utf8'));
                console.log(`找到 ${standardsData.length} 個租賃標準記錄`);

                for (const standard of standardsData) {
                    await models.RentalStandard.create(standard);
                }
                console.log('✓ 租賃標準數據遷移完成');
            } else {
                console.log('! 找不到租賃標準數據文件');
            }
        } catch (error) {
            console.error('× 租賃標準數據遷移失敗:', error);
        }

        // 5. 遷移分潤標準數據
        try {
            if (fs.existsSync(path.join(dataDir, 'profitSharingStandards.json'))) {
                const standardsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'profitSharingStandards.json'), 'utf8'));
                console.log(`找到 ${standardsData.length} 個分潤標準記錄`);

                for (const standard of standardsData) {
                    await models.ProfitSharingStandard.create(standard);
                }
                console.log('✓ 分潤標準數據遷移完成');
            } else {
                console.log('! 找不到分潤標準數據文件');
            }
        } catch (error) {
            console.error('× 分潤標準數據遷移失敗:', error);
        }

        // 6. 遷移租金收款數據
        try {
            if (fs.existsSync(path.join(dataDir, 'rentalPayments.json'))) {
                const paymentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'rentalPayments.json'), 'utf8'));
                console.log(`找到 ${paymentsData.length} 個租金收款記錄`);

                for (const payment of paymentsData) {
                    await models.RentalPayment.create(payment);
                }
                console.log('✓ 租金收款數據遷移完成');
            } else {
                console.log('! 找不到租金收款數據文件');
            }
        } catch (error) {
            console.error('× 租金收款數據遷移失敗:', error);
        }

        // 7. 遷移會員分潤數據
        try {
            if (fs.existsSync(path.join(dataDir, 'memberProfits.json'))) {
                const profitsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'memberProfits.json'), 'utf8'));
                console.log(`找到 ${profitsData.length} 個會員分潤記錄`);

                for (const profit of profitsData) {
                    await models.MemberProfit.create(profit);
                }
                console.log('✓ 會員分潤數據遷移完成');
            } else {
                console.log('! 找不到會員分潤數據文件');
            }
        } catch (error) {
            console.error('× 會員分潤數據遷移失敗:', error);
        }

        // 8. 遷移發票數據
        try {
            if (fs.existsSync(path.join(dataDir, 'invoices.json'))) {
                const invoicesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'invoices.json'), 'utf8'));
                console.log(`找到 ${invoicesData.length} 個發票記錄`);

                for (const invoice of invoicesData) {
                    await models.Invoice.create(invoice);
                }
                console.log('✓ 發票數據遷移完成');
            } else {
                console.log('! 找不到發票數據文件');
            }
        } catch (error) {
            console.error('× 發票數據遷移失敗:', error);
        }

        console.log('----------------------------');
        console.log('數據遷移過程完成！');
        process.exit(0);
    } catch (error) {
        console.error('遷移過程失敗:', error);
        process.exit(1);
    }
}

runMigration();