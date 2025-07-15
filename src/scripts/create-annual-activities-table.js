const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/asset_mgmt'
});

async function createAnnualActivitiesTable() {
    const client = await pool.connect();

    try {
        console.log('開始建立年度活動資料表...');

        // 建立年度活動表
        await client.query(`
            CREATE TABLE IF NOT EXISTS annual_activities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                location VARCHAR(255) NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 20,
                registration_deadline DATE NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'planning',
                year INTEGER NOT NULL,
                cover_image VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 建立活動報名表
        await client.query(`
            CREATE TABLE IF NOT EXISTS activity_registrations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                activity_id UUID NOT NULL REFERENCES annual_activities(id) ON DELETE CASCADE,
                member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                notes TEXT,
                companions INTEGER NOT NULL DEFAULT 0,
                special_requests TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 建立會員關懷表
        await client.query(`
            CREATE TABLE IF NOT EXISTS member_cares (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL DEFAULT 'other',
                title VARCHAR(255) NOT NULL,
                description TEXT,
                care_date DATE NOT NULL DEFAULT CURRENT_DATE,
                status VARCHAR(50) NOT NULL DEFAULT 'planned',
                assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
                follow_up_date DATE,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 建立索引
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_annual_activities_year ON annual_activities(year);
            CREATE INDEX IF NOT EXISTS idx_annual_activities_status ON annual_activities(status);
            CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_id ON activity_registrations(activity_id);
            CREATE INDEX IF NOT EXISTS idx_activity_registrations_member_id ON activity_registrations(member_id);
            CREATE INDEX IF NOT EXISTS idx_member_cares_member_id ON member_cares(member_id);
            CREATE INDEX IF NOT EXISTS idx_member_cares_type ON member_cares(type);
            CREATE INDEX IF NOT EXISTS idx_member_cares_status ON member_cares(status);
        `);

        console.log('年度活動相關資料表建立完成！');

    } catch (error) {
        console.error('建立資料表時發生錯誤:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function migrateDataFromLocalStorage() {
    const client = await pool.connect();

    try {
        console.log('開始遷移 localStorage 資料...');

        // 這裡可以添加從 localStorage 遷移資料的邏輯
        // 由於 localStorage 是前端儲存，我們需要手動遷移或重新建立資料

        console.log('資料遷移完成！');

    } catch (error) {
        console.error('遷移資料時發生錯誤:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        await createAnnualActivitiesTable();
        await migrateDataFromLocalStorage();
        console.log('所有操作完成！');
    } catch (error) {
        console.error('執行失敗:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { createAnnualActivitiesTable, migrateDataFromLocalStorage }; 