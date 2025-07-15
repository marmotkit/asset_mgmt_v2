const { Sequelize, DataTypes } = require('sequelize');

// 資料庫連線設定
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/asset_mgmt', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

async function addPlainPasswordColumn() {
    try {
        console.log('開始新增 plainPassword 欄位...');

        // 新增 plainPassword 欄位
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "plainPassword" VARCHAR(255);
        `);

        console.log('✅ plainPassword 欄位新增成功！');

        // 檢查欄位是否新增成功
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'plainPassword';
        `);

        if (results.length > 0) {
            console.log('✅ 確認 plainPassword 欄位已存在於 users 表中');
        } else {
            console.log('❌ plainPassword 欄位新增失敗');
        }

    } catch (error) {
        console.error('❌ 新增 plainPassword 欄位時發生錯誤:', error);
    } finally {
        await sequelize.close();
    }
}

// 執行腳本
addPlainPasswordColumn(); 