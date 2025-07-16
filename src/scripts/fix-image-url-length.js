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

async function fixImageUrlLength() {
    try {
        console.log('開始修正投資標的圖片表結構...');

        // 檢查當前表結構
        console.log('1. 檢查當前表結構...');
        const [columns] = await sequelize.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'investment_images' 
            AND column_name = 'image_url'
        `);

        console.log('當前 image_url 欄位資訊:', columns[0]);

        // 修改 image_url 欄位為 TEXT 類型以支援長字串
        console.log('2. 修改 image_url 欄位為 TEXT 類型...');
        await sequelize.query(`
            ALTER TABLE investment_images 
            ALTER COLUMN image_url TYPE TEXT
        `);
        console.log('✓ image_url 欄位已修改為 TEXT 類型');

        // 驗證修改結果
        console.log('3. 驗證修改結果...');
        const [updatedColumns] = await sequelize.query(`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'investment_images' 
            AND column_name = 'image_url'
        `);

        console.log('修改後 image_url 欄位資訊:', updatedColumns[0]);

        console.log('\n=== 投資標的圖片表結構修正完成 ===');
        console.log('image_url 欄位現在支援長字串資料');

    } catch (error) {
        console.error('修正投資標的圖片表結構失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    fixImageUrlLength();
}

module.exports = fixImageUrlLength; 