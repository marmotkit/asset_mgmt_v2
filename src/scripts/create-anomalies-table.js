const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

async function createAnomaliesTable() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    });

    const client = await pool.connect();

    try {
        console.log('開始建立異常記錄資料表...');

        // 建立異常記錄資料表
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS anomalies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type VARCHAR(100) NOT NULL,
                person_id VARCHAR(100),
                person_name VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                occurrence_date DATE NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT '待處理',
                handling_method TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(createTableQuery);
        console.log('✓ 異常記錄資料表建立成功');

        // 建立索引
        const createIndexQuery = `
            CREATE INDEX IF NOT EXISTS idx_anomalies_type ON anomalies(type);
            CREATE INDEX IF NOT EXISTS idx_anomalies_status ON anomalies(status);
            CREATE INDEX IF NOT EXISTS idx_anomalies_date ON anomalies(occurrence_date);
        `;

        await client.query(createIndexQuery);
        console.log('✓ 異常記錄資料表索引建立成功');

        // 檢查是否有現有資料
        const checkDataQuery = 'SELECT COUNT(*) FROM anomalies';
        const result = await client.query(checkDataQuery);
        console.log(`✓ 異常記錄資料表目前有 ${result.rows[0].count} 筆記錄`);

    } catch (error) {
        console.error('建立異常記錄資料表失敗:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    createAnomaliesTable()
        .then(() => {
            console.log('異常記錄資料表建立完成');
            process.exit(0);
        })
        .catch((error) => {
            console.error('異常記錄資料表建立失敗:', error);
            process.exit(1);
        });
}

module.exports = { createAnomaliesTable }; 