const { sequelize } = require('../models');

async function resetDatabase() {
    try {
        console.log('開始重置資料庫...');

        // 1. 刪除所有表格
        console.log('1. 刪除所有表格...');
        await sequelize.drop();
        console.log('✓ 所有表格已刪除');

        // 2. 重新建立所有表格
        console.log('2. 重新建立所有表格...');
        await sequelize.sync({ force: true });
        console.log('✓ 所有表格已重新建立');

        console.log('\n=== 資料庫重置完成 ===');
        console.log('現在可以重新部署應用程式');

    } catch (error) {
        console.error('資料庫重置失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    resetDatabase();
}

module.exports = resetDatabase; 