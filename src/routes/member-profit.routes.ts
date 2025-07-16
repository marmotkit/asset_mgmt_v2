import express from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middlewares/auth.middleware';

// 建立 PostgreSQL 連接池
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // 最大連接數
    idleTimeoutMillis: 30000, // 空閒連接超時
    connectionTimeoutMillis: 2000, // 連接超時
});

// 優雅關閉連接池
process.on('SIGINT', () => {
    pool.end();
    process.exit(0);
});

process.on('SIGTERM', () => {
    pool.end();
    process.exit(0);
});

const router = express.Router();

// 應用認證中間件
router.use(authMiddleware);

// 獲取會員分潤列表
router.get('/', async (req, res) => {
    try {
        const { investmentId, memberId, year, month } = req.query;
        const user = (req as any).user; // 從認證中間件獲取用戶資訊

        let query = `
            SELECT 
                mp.*,
                i.name as investment_name,
                u.name as member_name,
                u."memberNo" as member_no
            FROM member_profits mp
            LEFT JOIN investments i ON mp."investmentId" = i.id
            LEFT JOIN users u ON mp."memberId" = u.id
            WHERE 1=1
        `;

        // 加入除錯資訊
        console.log('查詢會員分潤列表，參數:', { investmentId, memberId, year, month });

        const params: any[] = [];
        let paramIndex = 1;

        // 權限控制：一般會員只能看到自己的分潤資料
        if (user && user.role !== 'admin' && user.role !== 'business' && user.role !== 'lifetime') {
            query += ` AND mp."memberId" = $${paramIndex}`;
            params.push(user.id);
            paramIndex++;
        }

        if (investmentId) {
            query += ` AND mp."investmentId" = $${paramIndex}`;
            params.push(investmentId);
            paramIndex++;
        }

        if (memberId) {
            query += ` AND mp."memberId" = $${paramIndex}`;
            params.push(memberId);
            paramIndex++;
        }

        if (year) {
            query += ` AND mp.year = $${paramIndex}`;
            params.push(year);
            paramIndex++;
        }

        if (month) {
            query += ` AND mp.month = $${paramIndex}`;
            params.push(month);
            paramIndex++;
        }

        query += ` ORDER BY mp.year DESC, mp.month DESC, mp."createdAt" DESC`;

        const result = await pool.query(query, params);

        const memberProfits = result.rows.map((row: any) => {
            // 加入除錯資訊
            console.log('會員分潤資料行:', {
                id: row.id,
                memberId: row.memberId || row.member_id,
                memberName: row.member_name,
                memberNo: row.member_no,
                investmentName: row.investment_name
            });

            return {
                id: row.id,
                investmentId: row.investmentId || row.investment_id,
                memberId: row.memberId || row.member_id,
                year: row.year,
                month: row.month,
                amount: parseFloat(row.amount),
                status: row.status,
                paymentDate: row.paymentDate || row.payment_date,
                note: row.note,
                createdAt: row.createdAt || row.created_at,
                updatedAt: row.updatedAt || row.updated_at,
                investmentName: row.investment_name,
                memberName: row.member_name || '未知會員',
                memberNo: row.member_no
            };
        });

        res.json(memberProfits);
    } catch (error) {
        console.error('獲取會員分潤列表失敗:', error);
        res.status(500).json({ error: '獲取會員分潤列表失敗' });
    }
});

// 創建會員分潤項目
router.post('/', async (req, res) => {
    try {
        const {
            investmentId,
            memberId,
            year,
            month,
            amount,
            status,
            paymentDate,
            note
        } = req.body;

        const query = `
            INSERT INTO member_profits (
                id, "investmentId", "memberId", year, month, amount, 
                status, "paymentDate", note, 
                "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
            ) RETURNING *
        `;

        const result = await pool.query(query, [
            investmentId,
            memberId,
            year,
            month,
            amount,
            status,
            paymentDate,
            note
        ]);

        const memberProfit = result.rows[0];
        res.status(201).json({
            id: memberProfit.id,
            investmentId: memberProfit.investmentId,
            memberId: memberProfit.memberId,
            year: memberProfit.year,
            month: memberProfit.month,
            amount: parseFloat(memberProfit.amount),
            status: memberProfit.status,
            paymentDate: memberProfit.paymentDate,
            note: memberProfit.note,
            createdAt: memberProfit.createdAt,
            updatedAt: memberProfit.updatedAt
        });
    } catch (error) {
        console.error('創建會員分潤項目失敗:', error);
        res.status(500).json({ error: '創建會員分潤項目失敗' });
    }
});

// 更新會員分潤項目
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            amount,
            status,
            paymentDate,
            note
        } = req.body;

        const query = `
            UPDATE member_profits 
            SET 
                amount = $1,
                status = $2,
                "paymentDate" = $3,
                note = $4,
                "updatedAt" = NOW()
            WHERE id = $5
            RETURNING *
        `;

        const result = await pool.query(query, [
            amount,
            status,
            paymentDate,
            note,
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: '會員分潤項目不存在' });
        }

        const memberProfit = result.rows[0];
        res.json({
            id: memberProfit.id,
            investmentId: memberProfit.investmentId,
            memberId: memberProfit.memberId,
            year: memberProfit.year,
            month: memberProfit.month,
            amount: parseFloat(memberProfit.amount),
            status: memberProfit.status,
            paymentDate: memberProfit.paymentDate,
            note: memberProfit.note,
            createdAt: memberProfit.createdAt,
            updatedAt: memberProfit.updatedAt
        });
    } catch (error) {
        console.error('更新會員分潤項目失敗:', error);
        res.status(500).json({ error: '更新會員分潤項目失敗' });
    }
});

// 清除會員分潤項目
router.delete('/clear-all', async (req, res) => {
    try {
        const { year, month } = req.query;

        let query = 'DELETE FROM member_profits WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (year) {
            query += ` AND year = $${paramIndex}`;
            params.push(year);
            paramIndex++;
        }

        if (month) {
            query += ` AND month = $${paramIndex}`;
            params.push(month);
            paramIndex++;
        }

        const result = await pool.query(query, params);

        res.json({
            message: `成功清除 ${result.rowCount} 筆會員分潤項目`,
            deletedCount: result.rowCount
        });

    } catch (error) {
        console.error('清除會員分潤項目失敗:', error);
        res.status(500).json({ error: '清除會員分潤項目失敗' });
    }
});

// 刪除會員分潤項目
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM member_profits WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: '會員分潤項目不存在' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('刪除會員分潤項目失敗:', error);
        res.status(500).json({ error: '刪除會員分潤項目失敗' });
    }
});

// 生成會員分潤項目
router.post('/generate', async (req, res) => {
    try {
        const { investmentId, year } = req.body;

        if (!investmentId || !year) {
            return res.status(400).json({ error: '缺少必要參數' });
        }

        // 檢查是否已存在該投資項目的分潤項目
        const existingQuery = `
            SELECT COUNT(*) as count 
            FROM member_profits 
            WHERE "investmentId" = $1 AND year = $2
        `;
        const existingResult = await pool.query(existingQuery, [investmentId, year]);

        if (parseInt(existingResult.rows[0].count) > 0) {
            return res.status(400).json({ error: '該投資項目的分潤項目已存在，請勿重複生成' });
        }

        // 獲取投資項目資訊
        const investmentQuery = 'SELECT * FROM investments WHERE id = $1';
        const investmentResult = await pool.query(investmentQuery, [investmentId]);

        if (investmentResult.rows.length === 0) {
            return res.status(404).json({ error: '找不到投資項目' });
        }

        const investment = investmentResult.rows[0];

        if (!investment.userId) {
            return res.status(400).json({ error: '投資項目未指定所屬會員' });
        }

        // 獲取該年度的租金收款項目
        const rentalQuery = `
            SELECT * FROM rental_payments 
            WHERE "investmentId" = $1 AND year = $2
            ORDER BY month
        `;
        const rentalResult = await pool.query(rentalQuery, [investmentId, year]);

        if (rentalResult.rows.length === 0) {
            return res.status(400).json({ error: '未找到該投資項目的租金收款項目' });
        }

        // 獲取分潤標準
        const standardQuery = `
            SELECT * FROM profit_sharing_standards 
            WHERE "investmentId" = $1
            ORDER BY "startDate"
        `;
        const standardResult = await pool.query(standardQuery, [investmentId]);

        if (standardResult.rows.length === 0) {
            return res.status(400).json({ error: '未設定分潤標準' });
        }

        const standards = standardResult.rows;
        const rentalPayments = rentalResult.rows;

        // 生成分潤項目
        const insertQuery = `
            INSERT INTO member_profits (
                id, "investmentId", "memberId", year, month, amount, 
                status, "paymentDate", note, 
                "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
            )
        `;

        let generatedCount = 0;

        for (const standard of standards) {
            const startDate = new Date(standard.startDate);
            const endDate = standard.endDate ? new Date(standard.endDate) : new Date(year, 11, 31);

            // 跳過不適用的分潤標準
            if (startDate.getFullYear() > year || endDate.getFullYear() < year) {
                continue;
            }

            // 計算適用的月份範圍
            const startMonth = startDate.getFullYear() === year ? startDate.getMonth() + 1 : 1;
            const endMonth = endDate.getFullYear() === year ? endDate.getMonth() + 1 : 12;

            for (let month = startMonth; month <= endMonth; month++) {
                // 查找對應月份的租金收款項目
                const rentalPayment = rentalPayments.find((p: any) => p.month === month);
                if (!rentalPayment) {
                    continue;
                }

                // 計算分潤金額
                let amount = 0;
                console.log('分潤標準:', {
                    id: standard.id,
                    type: standard.type,
                    value: standard.value,
                    startDate: standard.startDate,
                    endDate: standard.endDate
                });
                console.log('租金收款項目:', {
                    id: rentalPayment.id,
                    month: rentalPayment.month,
                    amount: rentalPayment.amount
                });

                if (standard.type === 'FIXED_AMOUNT' || standard.type === 'fixed_amount') {
                    amount = parseFloat(standard.value) || 0;
                    console.log('固定金額分潤:', amount);
                } else if (standard.type === 'PERCENTAGE' || standard.type === 'percentage') {
                    const rentalAmount = parseFloat(rentalPayment.amount) || 0;
                    const percentage = parseFloat(standard.value) || 0;
                    amount = rentalAmount * (percentage / 100);
                    console.log('百分比分潤:', { rentalAmount, percentage, amount });
                } else {
                    console.log('未知的分潤類型:', standard.type);
                }

                // 生成更有意義的備註
                const standardTypeText = standard.type === 'FIXED_AMOUNT' ? '固定金額' : '百分比';
                const standardValueText = standard.type === 'FIXED_AMOUNT'
                    ? `$${standard.value}`
                    : `${standard.value}%`;

                const note = `基於${standardTypeText}分潤標準(${standardValueText})自動生成`;

                // 插入分潤項目
                await pool.query(insertQuery, [
                    investmentId,
                    investment.userId,
                    year,
                    month,
                    amount,
                    'pending',
                    null,
                    note
                ]);

                generatedCount++;
            }
        }

        res.json({
            message: `成功生成 ${generatedCount} 筆會員分潤項目`,
            generatedCount
        });

    } catch (error) {
        console.error('生成會員分潤項目失敗:', error);
        res.status(500).json({ error: '生成會員分潤項目失敗' });
    }
});

// 獲取可用於生成分潤的投資項目（有租賃標準和分潤標準的）
router.get('/available-investments', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                i.id,
                i.name,
                i.type,
                i.amount,
                i."startDate",
                i.status,
                c.name as company_name,
                u.name as user_name
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            INNER JOIN rental_standards rs ON i.id = rs."investmentId"
            INNER JOIN profit_sharing_standards pss ON i.id = pss."investmentId"
            WHERE i.status = 'active'
            ORDER BY i.name
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('獲取可用於生成分潤的投資項目失敗:', error);
        res.status(500).json({ error: '獲取可用於生成分潤的投資項目失敗' });
    }
});

export default router; 