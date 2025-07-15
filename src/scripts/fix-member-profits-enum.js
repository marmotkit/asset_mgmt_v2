const sequelize = require('../db/connection').default;

async function fixMemberProfitsEnum() {
    try {
        console.log('開始修正 member_profits 表的 status 欄位 ENUM 類型...');

        // 連接到資料庫
        await sequelize.authenticate();
        console.log('資料庫連接成功');

        // 檢查當前的 ENUM 類型
        const [currentEnum] = await sequelize.query(`
            SELECT unnest(enum_range(NULL::enum_member_profits_status)) as enum_value;
        `);
        console.log('當前 ENUM 值:', currentEnum.map(row => row.enum_value));

        // 如果 ENUM 類型不正確，需要重新創建
        const enumValues = currentEnum.map(row => row.enum_value);
        if (!enumValues.includes('pending') || !enumValues.includes('paid') || !enumValues.includes('overdue')) {
            console.log('需要更新 ENUM 類型...');

            // 先備份現有資料
            const [existingData] = await sequelize.query(`
                SELECT * FROM member_profits;
            `);
            console.log(`備份了 ${existingData.length} 筆資料`);

            // 刪除現有表
            await sequelize.query(`DROP TABLE IF EXISTS member_profits CASCADE;`);
            console.log('已刪除舊的 member_profits 表');

            // 重新同步模型（這會創建新的表）
            await sequelize.sync({ force: false });
            console.log('已重新創建 member_profits 表');

            // 恢復資料（如果有的話）
            if (existingData.length > 0) {
                console.log('恢復資料中...');
                for (const row of existingData) {
                    // 轉換狀態值
                    let newStatus = 'pending';
                    if (row.status === 'paid') newStatus = 'paid';
                    else if (row.status === 'late' || row.status === 'overdue') newStatus = 'overdue';

                    await sequelize.query(`
                        INSERT INTO member_profits (
                            id, "investmentId", "memberId", year, month, amount, 
                            status, "paymentDate", note, "createdAt", "updatedAt"
                        ) VALUES (
                            :id, :investmentId, :memberId, :year, :month, :amount, 
                            :status, :paymentDate, :note, :createdAt, :updatedAt
                        )
                    `, {
                        replacements: {
                            id: row.id,
                            investmentId: row.investmentId,
                            memberId: row.memberId,
                            year: row.year,
                            month: row.month,
                            amount: row.amount,
                            status: newStatus,
                            paymentDate: row.paymentDate,
                            note: row.note,
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt
                        }
                    });
                }
                console.log('資料恢復完成');
            }
        } else {
            console.log('ENUM 類型已經是正確的，無需修改');
        }

        // 驗證修正結果
        const [newEnum] = await sequelize.query(`
            SELECT unnest(enum_range(NULL::enum_member_profits_status)) as enum_value;
        `);
        console.log('修正後的 ENUM 值:', newEnum.map(row => row.enum_value));

        console.log('✅ member_profits 表 ENUM 修正完成');

    } catch (error) {
        console.error('修正 member_profits 表 ENUM 失敗:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    fixMemberProfitsEnum();
}

module.exports = fixMemberProfitsEnum; 