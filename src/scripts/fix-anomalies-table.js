const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
    } : false
});

async function fixAnomaliesTable() {
    try {
        console.log('開始修正 anomalies 資料表結構...');

        // 檢查表是否存在
        const tableExists = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'anomalies';
        `);

        if (tableExists.rows.length > 0) {
            console.log('刪除現有的 anomalies 資料表...');
            await pool.query('DROP TABLE IF EXISTS anomalies CASCADE');
        }

        console.log('建立新的 anomalies 資料表...');
        await pool.query(`
            CREATE TABLE anomalies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type VARCHAR(255) NOT NULL,
                person_id VARCHAR(255),
                person_name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                occurrence_date DATE NOT NULL,
                status VARCHAR(255) NOT NULL DEFAULT '待處理',
                handling_method TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('anomalies 資料表建立成功！');

        // 驗證欄位結構
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'anomalies'
            ORDER BY ordinal_position;
        `);

        console.log('新的欄位結構:');
        columns.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
        });

    } catch (error) {
        console.error('修正資料表結構時發生錯誤:', error);
    } finally {
        await pool.end();
    }
}

fixAnomaliesTable(); 