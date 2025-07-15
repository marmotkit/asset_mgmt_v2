const { Sequelize } = require('sequelize');

// 資料庫連線設定 - 使用環境變數
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function migratePlainPassword() {
    try {
        console.log('開始執行 plainPassword 欄位遷移...');

        // 檢查是否已經存在 plainPassword 欄位
        const [existingColumns] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'plainPassword';
        `);

        if (existingColumns.length > 0) {
            console.log('✅ plainPassword 欄位已存在，跳過遷移');
            return;
        }

        // 新增 plainPassword 欄位
        console.log('新增 plainPassword 欄位...');
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN "plainPassword" VARCHAR(255);
        `);

        console.log('✅ plainPassword 欄位新增成功！');

        // 為現有用戶設定預設明文密碼（基於用戶名）
        console.log('為現有用戶設定預設明文密碼...');
        const [users] = await sequelize.query(`
            SELECT id, username, "plainPassword" 
            FROM users 
            WHERE "plainPassword" IS NULL OR "plainPassword" = '';
        `);

        for (const user of users) {
            // 為每個用戶設定預設密碼為用戶名 + '123'
            const defaultPassword = user.username + '123';
            await sequelize.query(`
                UPDATE users 
                SET "plainPassword" = $1 
                WHERE id = $2
            `, {
                bind: [defaultPassword, user.id],
                type: Sequelize.QueryTypes.UPDATE
            });
            console.log(`✅ 用戶 ${user.username} 密碼設定為: ${defaultPassword}`);
        }

        console.log('✅ 所有用戶的預設明文密碼設定完成！');

        // 驗證遷移結果
        const [finalCheck] = await sequelize.query(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE "plainPassword" IS NOT NULL AND "plainPassword" != '';
        `);

        console.log(`✅ 遷移完成！共有 ${finalCheck[0].count} 個用戶設定了明文密碼`);

    } catch (error) {
        console.error('❌ 遷移過程中發生錯誤:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// 執行遷移
migratePlainPassword()
    .then(() => {
        console.log('🎉 遷移成功完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 遷移失敗:', error);
        process.exit(1);
    }); 