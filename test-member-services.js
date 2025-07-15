const { Pool } = require('pg');

// 資料庫連接設定
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/asset_mgmt'
});

async function testDatabaseConnection() {
    const client = await pool.connect();

    try {
        console.log('測試資料庫連接...');

        // 測試連接
        const result = await client.query('SELECT NOW()');
        console.log('資料庫連接成功，當前時間:', result.rows[0].now);

        // 檢查年度活動表
        console.log('\n檢查年度活動表...');
        const activitiesResult = await client.query('SELECT COUNT(*) FROM annual_activities');
        console.log('年度活動表記錄數:', activitiesResult.rows[0].count);

        // 檢查會員關懷表
        console.log('\n檢查會員關懷表...');
        const caresResult = await client.query('SELECT COUNT(*) FROM member_cares');
        console.log('會員關懷表記錄數:', caresResult.rows[0].count);

        // 檢查使用者表
        console.log('\n檢查使用者表...');
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        console.log('使用者表記錄數:', usersResult.rows[0].count);

        // 如果有使用者，嘗試插入測試資料
        if (parseInt(usersResult.rows[0].count) > 0) {
            console.log('\n嘗試插入測試資料...');

            // 獲取第一個使用者
            const firstUser = await client.query('SELECT id FROM users LIMIT 1');
            const userId = firstUser.rows[0].id;

            // 插入測試年度活動
            const testActivity = {
                title: '測試活動',
                description: '這是一個測試活動',
                startDate: '2025-12-25',
                endDate: '2025-12-25',
                location: '測試地點',
                capacity: 10,
                registrationDeadline: '2025-12-20',
                status: 'planning',
                year: 2025
            };

            const activityQuery = `
                INSERT INTO annual_activities (
                    title, description, start_date, end_date, location, 
                    capacity, registration_deadline, status, year
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const activityValues = [
                testActivity.title, testActivity.description, testActivity.startDate,
                testActivity.endDate, testActivity.location, testActivity.capacity,
                testActivity.registrationDeadline, testActivity.status, testActivity.year
            ];

            const activityResult = await client.query(activityQuery, activityValues);
            console.log('測試年度活動插入成功:', activityResult.rows[0]);

            // 插入測試會員關懷記錄
            const testCare = {
                memberId: userId,
                type: 'birthday',
                title: '測試關懷',
                description: '這是一個測試關懷記錄',
                careDate: '2025-12-25',
                status: 'planned'
            };

            const careQuery = `
                INSERT INTO member_cares (
                    member_id, type, title, description, care_date, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const careValues = [
                testCare.memberId, testCare.type, testCare.title,
                testCare.description, testCare.careDate, testCare.status
            ];

            const careResult = await client.query(careQuery, careValues);
            console.log('測試會員關懷記錄插入成功:', careResult.rows[0]);

            // 再次檢查記錄數
            const newActivitiesResult = await client.query('SELECT COUNT(*) FROM annual_activities');
            const newCaresResult = await client.query('SELECT COUNT(*) FROM member_cares');
            console.log('\n插入後的記錄數:');
            console.log('年度活動表記錄數:', newActivitiesResult.rows[0].count);
            console.log('會員關懷表記錄數:', newCaresResult.rows[0].count);
        }

    } catch (error) {
        console.error('測試失敗:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// 執行測試
testDatabaseConnection().catch(console.error); 