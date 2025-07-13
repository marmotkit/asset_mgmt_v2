const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

console.log('【連線字串】', DATABASE_URL);

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    ssl: process.env.NODE_ENV === 'production',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

async function createFeeSettingsTable() {
    try {
        console.log('【開始建立 fee_settings 資料表...】');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS fee_settings (
                id SERIAL PRIMARY KEY,
                member_type VARCHAR(50) NOT NULL,
                amount INTEGER NOT NULL,
                period VARCHAR(20) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('【fee_settings 資料表建立成功！】');

        // 插入預設資料
        console.log('【插入預設會費標準資料...】');
        await sequelize.query(`
            INSERT INTO fee_settings (member_type, amount, period, description) VALUES
            ('一般會員', 30000, '年', '一般會員年費'),
            ('永久會員', 300000, '5年', '永久會員5年費用'),
            ('商務會員', 3000000, '5年', '商務會員5年費用'),
            ('管理員', 0, '永久', '管理員免費')
            ON CONFLICT (member_type) DO NOTHING;
        `);
        console.log('【預設會費標準資料插入成功！】');

        // 顯示建立的資料
        const [results] = await sequelize.query('SELECT * FROM fee_settings ORDER BY id;');
        console.log('【fee_settings 資料表內容如下】');
        console.table(results);
    } catch (error) {
        console.error('【建立 fee_settings 資料表失敗】:', error);
        console.error('【請檢查 DATABASE_URL 是否正確，以及 Render 資料庫權限】');
    } finally {
        await sequelize.close();
        console.log('【資料庫連線已關閉】');
    }
}

createFeeSettingsTable(); 