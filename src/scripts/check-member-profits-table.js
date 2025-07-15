const { Pool } = require('pg');

async function checkMemberProfitsTable() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('檢查 member_profits 表結構...');

        // 檢查表是否存在
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'member_profits'
            );
        `);

        if (!tableExists.rows[0].exists) {
            console.log('member_profits 表不存在，正在創建...');

            await pool.query(`
                CREATE TABLE member_profits (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    "investmentId" UUID NOT NULL REFERENCES investments(id),
                    "memberId" UUID NOT NULL REFERENCES users(id),
                    year INTEGER NOT NULL,
                    month INTEGER NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
                    "paymentDate" TIMESTAMP WITH TIME ZONE,
                    note TEXT,
                    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('member_profits 表創建成功');
        } else {
            console.log('member_profits 表已存在，檢查結構...');

            // 檢查 id 欄位是否有預設值
            const idColumn = await pool.query(`
                SELECT column_default, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'member_profits' 
                AND column_name = 'id';
            `);

            console.log('id 欄位資訊:', idColumn.rows[0]);

            // 如果 id 欄位沒有預設值，添加預設值
            if (!idColumn.rows[0].column_default) {
                console.log('id 欄位沒有預設值，正在添加...');
                await pool.query(`
                    ALTER TABLE member_profits 
                    ALTER COLUMN id SET DEFAULT gen_random_uuid();
                `);
                console.log('id 欄位預設值添加成功');
            }

            // 檢查 status 欄位的 ENUM 約束
            const statusColumn = await pool.query(`
                SELECT data_type, column_default, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'member_profits' 
                AND column_name = 'status';
            `);

            console.log('status 欄位資訊:', statusColumn.rows[0]);
        }

        // 顯示表結構
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'member_profits'
            ORDER BY ordinal_position;
        `);

        console.log('\nmember_profits 表結構:');
        columns.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });

    } catch (error) {
        console.error('檢查 member_profits 表時發生錯誤:', error);
    } finally {
        await pool.end();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    checkMemberProfitsTable();
}

module.exports = checkMemberProfitsTable; 