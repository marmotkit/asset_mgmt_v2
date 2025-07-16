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

async function fixOldImageUrls() {
    try {
        console.log('開始清理舊的圖片 URL...');

        // 檢查是否有舊的 via.placeholder.com URL
        console.log('1. 檢查舊的圖片 URL...');
        const [oldUrls] = await sequelize.query(`
            SELECT id, image_url 
            FROM investment_images 
            WHERE image_url LIKE '%via.placeholder.com%'
        `);

        console.log(`找到 ${oldUrls.length} 個舊的圖片 URL`);

        if (oldUrls.length > 0) {
            console.log('2. 更新舊的圖片 URL...');
            await sequelize.query(`
                UPDATE investment_images 
                SET image_url = 'https://picsum.photos/400/300?random=1'
                WHERE image_url LIKE '%via.placeholder.com%'
            `);
            console.log('✓ 舊的圖片 URL 已更新');
        } else {
            console.log('沒有找到需要更新的圖片 URL');
        }

        // 檢查是否有過長的 base64 資料
        console.log('3. 檢查過長的圖片資料...');
        const [longUrls] = await sequelize.query(`
            SELECT id, LENGTH(image_url) as url_length
            FROM investment_images 
            WHERE LENGTH(image_url) > 500
        `);

        console.log(`找到 ${longUrls.length} 個過長的圖片資料`);

        if (longUrls.length > 0) {
            console.log('4. 更新過長的圖片資料...');
            await sequelize.query(`
                UPDATE investment_images 
                SET image_url = 'https://picsum.photos/400/300?random=1'
                WHERE LENGTH(image_url) > 500
            `);
            console.log('✓ 過長的圖片資料已更新');
        }

        console.log('\n=== 圖片 URL 清理完成 ===');

    } catch (error) {
        console.error('清理圖片 URL 失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    fixOldImageUrls();
}

module.exports = fixOldImageUrls; 