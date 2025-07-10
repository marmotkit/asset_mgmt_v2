const bcrypt = require('bcrypt');
const { User, Company, sequelize } = require('../models');

// 確保模型已同步
async function ensureModelsSynced() {
    try {
        await sequelize.authenticate();
        console.log('資料庫連接成功');

        // 同步模型
        await sequelize.sync({ force: true });
        console.log('模型同步完成');
    } catch (error) {
        console.error('模型同步失敗:', error);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        console.log('開始初始化資料庫...');

        // 確保模型已同步
        await ensureModelsSynced();

        // 1. 建立預設管理者帳號
        console.log('1. 建立管理者帳號...');
        const adminExists = await User.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                memberNo: 'A001',
                username: 'admin',
                password: hashedPassword,
                name: '系統管理員',
                email: 'admin@example.com',
                role: 'admin',
                status: 'active',
                isFirstLogin: false,
                preferences: '[]'
            });
            console.log('✓ 管理者帳號建立成功');
        } else {
            console.log('✓ 管理者帳號已存在');
        }

        // 2. 建立測試公司
        console.log('2. 建立測試公司...');
        const testCompanyExists = await Company.findOne({ where: { companyNo: 'C001' } });

        if (!testCompanyExists) {
            await Company.create({
                companyNo: 'C001',
                name: '測試公司',
                address: '台北市測試區測試路123號',
                phone: '02-1234-5678'
            });
            console.log('✓ 測試公司建立成功');
        } else {
            console.log('✓ 測試公司已存在');
        }

        // 3. 建立測試會員
        console.log('3. 建立測試會員...');
        const testUserExists = await User.findOne({ where: { username: 'test' } });

        if (!testUserExists) {
            const hashedPassword = await bcrypt.hash('test123', 10);
            await User.create({
                memberNo: 'M001',
                username: 'test',
                password: hashedPassword,
                name: '測試會員',
                email: 'test@example.com',
                role: 'normal',
                status: 'active',
                isFirstLogin: false,
                preferences: '[]'
            });
            console.log('✓ 測試會員建立成功');
        } else {
            console.log('✓ 測試會員已存在');
        }

        console.log('\n=== 資料庫初始化完成 ===');
        console.log('管理者帳號: admin / admin123');
        console.log('測試會員: test / test123');

    } catch (error) {
        console.error('資料庫初始化失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase; 