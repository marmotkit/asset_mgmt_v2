const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/asset_mgmt'
});

async function migrateActivityRegistrationsTable() {
    const client = await pool.connect();

    try {
        console.log('開始遷移活動報名資料表...');

        // 檢查是否需要新增欄位
        const checkColumnsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'activity_registrations' 
            AND column_name IN ('member_name', 'phone_number', 'total_participants', 'male_count', 'female_count')
        `;

        const existingColumns = await client.query(checkColumnsQuery);
        const existingColumnNames = existingColumns.rows.map(row => row.column_name);

        // 新增缺少的欄位
        if (!existingColumnNames.includes('member_name')) {
            console.log('新增 member_name 欄位...');
            await client.query(`
                ALTER TABLE activity_registrations 
                ADD COLUMN member_name VARCHAR(255)
            `);
        }

        if (!existingColumnNames.includes('phone_number')) {
            console.log('新增 phone_number 欄位...');
            await client.query(`
                ALTER TABLE activity_registrations 
                ADD COLUMN phone_number VARCHAR(50)
            `);
        }

        if (!existingColumnNames.includes('total_participants')) {
            console.log('新增 total_participants 欄位...');
            await client.query(`
                ALTER TABLE activity_registrations 
                ADD COLUMN total_participants INTEGER DEFAULT 1
            `);
        }

        if (!existingColumnNames.includes('male_count')) {
            console.log('新增 male_count 欄位...');
            await client.query(`
                ALTER TABLE activity_registrations 
                ADD COLUMN male_count INTEGER DEFAULT 0
            `);
        }

        if (!existingColumnNames.includes('female_count')) {
            console.log('新增 female_count 欄位...');
            await client.query(`
                ALTER TABLE activity_registrations 
                ADD COLUMN female_count INTEGER DEFAULT 0
            `);
        }

        // 更新現有資料
        console.log('更新現有報名資料...');
        await client.query(`
            UPDATE activity_registrations 
            SET 
                member_name = COALESCE(member_name, '未知'),
                phone_number = COALESCE(phone_number, ''),
                total_participants = COALESCE(total_participants, 1),
                male_count = COALESCE(male_count, 0),
                female_count = COALESCE(female_count, 0)
            WHERE member_name IS NULL 
               OR phone_number IS NULL 
               OR total_participants IS NULL 
               OR male_count IS NULL 
               OR female_count IS NULL
        `);

        // 讓 member_id 可為空（支援非會員報名）
        console.log('修改 member_id 欄位為可空...');
        await client.query(`
            ALTER TABLE activity_registrations 
            ALTER COLUMN member_id DROP NOT NULL
        `);

        console.log('活動報名資料表遷移完成！');

    } catch (error) {
        console.error('遷移活動報名資料表時發生錯誤:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    try {
        await migrateActivityRegistrationsTable();
        console.log('所有遷移操作完成！');
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

module.exports = { migrateActivityRegistrationsTable }; 