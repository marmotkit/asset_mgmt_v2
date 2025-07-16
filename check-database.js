const { Pool } = require('pg');

// 資料庫連接設定 - 使用與應用程式相同的設定
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false,
    },
});

async function checkDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔍 檢查資料庫狀態...\n');
        console.log('📡 連接字串:', DATABASE_URL.replace(/\/\/.*@/, '//***:***@')); // 隱藏密碼

        // 1. 檢查資料表是否存在
        console.log('\n📋 檢查資料表:');
        const tables = [
            'accounting_accounts',
            'accounting_categories',
            'accounting_journal',
            'accounting_receivables',
            'accounting_payables',
            'accounting_monthly_closings'
        ];

        for (const table of tables) {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `, [table]);

            const exists = result.rows[0].exists;
            console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? '存在' : '不存在'}`);
        }

        // 2. 檢查各資料表的記錄數量
        console.log('\n📊 各資料表的記錄數量:');
        for (const table of tables) {
            try {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0].count);
                console.log(`  📈 ${table}: ${count} 筆記錄`);
            } catch (error) {
                console.log(`  ❌ ${table}: 查詢失敗 - ${error.message}`);
            }
        }

        // 3. 檢查會計科目資料
        console.log('\n📋 會計科目資料:');
        try {
            const result = await client.query(`
                SELECT account_code, account_name, account_type, is_active
                FROM accounting_accounts
                ORDER BY account_code
                LIMIT 10
            `);

            if (result.rows.length > 0) {
                result.rows.forEach(row => {
                    console.log(`  ${row.account_code} - ${row.account_name} (${row.account_type})`);
                });
            } else {
                console.log('  ⚠️  沒有會計科目資料');
            }
        } catch (error) {
            console.log(`  ❌ 查詢會計科目失敗: ${error.message}`);
        }

        // 4. 檢查日記帳資料
        console.log('\n📝 日記帳資料:');
        try {
            const result = await client.query(`
                SELECT journal_number, journal_date, description, amount, created_at
                FROM accounting_journal
                ORDER BY created_at DESC
                LIMIT 5
            `);

            if (result.rows.length > 0) {
                result.rows.forEach(row => {
                    console.log(`  ${row.journal_number} - ${row.journal_date} - ${row.description} - $${row.amount}`);
                });
            } else {
                console.log('  ⚠️  沒有日記帳資料');
            }
        } catch (error) {
            console.log(`  ❌ 查詢日記帳失敗: ${error.message}`);
        }

        console.log('\n✅ 資料庫檢查完成！');

    } catch (error) {
        console.error('❌ 檢查資料庫時發生錯誤:', error);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 建議:');
            console.log('  1. 確認資料庫服務是否正在運行');
            console.log('  2. 檢查 DATABASE_URL 環境變數是否正確設定');
            console.log('  3. 如果是雲端部署，確認資料庫連接字串是否正確');
        }
    } finally {
        client.release();
        await pool.end();
    }
}

// 執行檢查
checkDatabase().catch(console.error); 