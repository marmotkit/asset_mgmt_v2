const { Pool } = require('pg');

// 資料庫連接設定
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/asset_mgmt',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDatabaseTables() {
    const client = await pool.connect();

    try {
        console.log('🔍 開始檢查資料庫資料表狀態...\n');

        // 1. 檢查所有資料表是否存在
        console.log('📋 檢查資料表是否存在:');
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

        console.log('\n📊 檢查各資料表的資料數量:');

        // 2. 檢查各資料表的記錄數量
        for (const table of tables) {
            try {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0].count);
                console.log(`  📈 ${table}: ${count} 筆記錄`);

                // 如果是會計科目表且有資料，顯示前5筆
                if (table === 'accounting_accounts' && count > 0) {
                    const accounts = await client.query(`
                        SELECT account_code, account_name, account_type, is_active 
                        FROM ${table} 
                        ORDER BY account_code 
                        LIMIT 5
                    `);
                    console.log('    範例資料:');
                    accounts.rows.forEach(row => {
                        console.log(`      ${row.account_code} - ${row.account_name} (${row.account_type})`);
                    });
                }

                // 如果是日記帳表且有資料，顯示前3筆
                if (table === 'accounting_journal' && count > 0) {
                    const journals = await client.query(`
                        SELECT journal_number, journal_date, description, amount 
                        FROM ${table} 
                        ORDER BY created_at DESC 
                        LIMIT 3
                    `);
                    console.log('    範例資料:');
                    journals.rows.forEach(row => {
                        console.log(`      ${row.journal_number} - ${row.journal_date} - ${row.description} - $${row.amount}`);
                    });
                }

            } catch (error) {
                console.log(`  ❌ ${table}: 查詢失敗 - ${error.message}`);
            }
        }

        console.log('\n🔧 檢查資料表結構:');

        // 3. 檢查資料表結構
        for (const table of tables) {
            try {
                const result = await client.query(`
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position
                `, [table]);

                console.log(`\n  📋 ${table} 結構:`);
                result.rows.forEach(row => {
                    const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                    const defaultValue = row.column_default ? ` DEFAULT ${row.column_default}` : '';
                    console.log(`    ${row.column_name}: ${row.data_type} ${nullable}${defaultValue}`);
                });

            } catch (error) {
                console.log(`  ❌ ${table}: 結構查詢失敗 - ${error.message}`);
            }
        }

        console.log('\n📈 檢查索引:');

        // 4. 檢查索引
        for (const table of tables) {
            try {
                const result = await client.query(`
                    SELECT indexname, indexdef 
                    FROM pg_indexes 
                    WHERE tablename = $1
                `, [table]);

                if (result.rows.length > 0) {
                    console.log(`  🔗 ${table} 索引:`);
                    result.rows.forEach(row => {
                        console.log(`    ${row.indexname}`);
                    });
                } else {
                    console.log(`  ⚠️  ${table}: 無索引`);
                }

            } catch (error) {
                console.log(`  ❌ ${table}: 索引查詢失敗 - ${error.message}`);
            }
        }

        console.log('\n✅ 資料庫檢查完成！');

    } catch (error) {
        console.error('❌ 檢查資料庫時發生錯誤:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// 執行測試
testDatabaseTables().catch(console.error); 