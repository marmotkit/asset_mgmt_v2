const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

async function createFeesTable() {
    try {
        console.log('【開始建立 fees 資料表...】');

        // 建立 fees 表
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS fees (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                member_id VARCHAR(255) NOT NULL,
                member_no VARCHAR(255) NOT NULL,
                member_name VARCHAR(255) NOT NULL,
                member_type VARCHAR(255) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                due_date DATE NOT NULL,
                status VARCHAR(255) NOT NULL DEFAULT 'pending',
                note TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('【fees 資料表建立成功！】');

        // 檢查表是否存在
        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'fees';
        `);

        if (results.length > 0) {
            console.log('【確認 fees 資料表已存在】');

            // 顯示表結構
            const [columns] = await sequelize.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'fees' 
                ORDER BY ordinal_position;
            `);

            console.log('【fees 資料表結構如下】');
            console.table(columns);
        } else {
            console.log('【警告：fees 資料表建立失敗】');
        }

    } catch (error) {
        console.error('【建立 fees 資料表失敗】:', error);
        console.error('【請檢查 DATABASE_URL 是否正確，以及 Render 資料庫權限】');
    } finally {
        await sequelize.close();
    }
}

createFeesTable(); 