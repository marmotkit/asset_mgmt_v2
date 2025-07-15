const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
    } : false
});

async function checkAnomaliesTable() {
    try {
        console.log('檢查 anomalies 資料表結構...');

        // 檢查表是否存在
        const tableExists = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'anomalies';
        `);

        if (tableExists.rows.length === 0) {
            console.log('anomalies 資料表不存在');
            return;
        }

        console.log('anomalies 資料表存在');

        // 檢查欄位結構
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'anomalies'
            ORDER BY ordinal_position;
        `);

        console.log('現有欄位結構:');
        columns.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
        });

    } catch (error) {
        console.error('檢查資料表結構時發生錯誤:', error);
    } finally {
        await pool.end();
    }
}

checkAnomaliesTable(); 