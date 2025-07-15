import express from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../db/connection';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 應用認證中間件
router.use(authMiddleware);

// 獲取會員分潤列表
router.get('/', async (req, res) => {
    try {
        const { investmentId, memberId, year, month } = req.query;

        let query = `
            SELECT 
                mp.*,
                i.name as investment_name,
                u.name as member_name
            FROM member_profits mp
            LEFT JOIN investments i ON mp."investmentId" = i.id
            LEFT JOIN users u ON mp."memberId" = u.id
            WHERE 1=1
        `;

        const replacements: any = {};

        if (investmentId) {
            query += ` AND mp."investmentId" = :investmentId`;
            replacements.investmentId = investmentId;
        }

        if (memberId) {
            query += ` AND mp."memberId" = :memberId`;
            replacements.memberId = memberId;
        }

        if (year) {
            query += ` AND mp.year = :year`;
            replacements.year = year;
        }

        if (month) {
            query += ` AND mp.month = :month`;
            replacements.month = month;
        }

        query += ` ORDER BY mp.year DESC, mp.month DESC, mp."createdAt" DESC`;

        const result = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        const memberProfits = result.map((row: any) => ({
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
            memberName: row.member_name
        }));

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
                "investmentId", "memberId", year, month, amount, 
                status, "paymentDate", note, 
                "createdAt", "updatedAt"
            ) VALUES (
                :investmentId, :memberId, :year, :month, :amount, 
                :status, :paymentDate, :note, 
                NOW(), NOW()
            ) RETURNING *
        `;

        const result = await sequelize.query(query, {
            replacements: {
                investmentId,
                memberId,
                year,
                month,
                amount,
                status,
                paymentDate,
                note
            },
            type: QueryTypes.INSERT
        });

        const memberProfit = (result[0] as any)[0];
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
                amount = :amount,
                status = :status,
                "paymentDate" = :paymentDate,
                note = :note,
                "updatedAt" = NOW()
            WHERE id = :id
            RETURNING *
        `;

        const result = await sequelize.query(query, {
            replacements: {
                amount,
                status,
                paymentDate,
                note,
                id
            },
            type: QueryTypes.UPDATE
        });

        if (!result[1] || result[1] === 0) {
            return res.status(404).json({ error: '會員分潤項目不存在' });
        }

        // 獲取更新後的資料
        const updatedQuery = 'SELECT * FROM member_profits WHERE id = :id';
        const updatedResult = await sequelize.query(updatedQuery, {
            replacements: { id },
            type: QueryTypes.SELECT
        });

        if (updatedResult.length === 0) {
            return res.status(404).json({ error: '會員分潤項目不存在' });
        }

        const memberProfit = updatedResult[0] as any;
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

// 刪除會員分潤項目
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM member_profits WHERE id = :id';
        const result = await sequelize.query(query, {
            replacements: { id },
            type: QueryTypes.DELETE
        });

        if (result[1] === 0) {
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
            WHERE "investmentId" = :investmentId AND year = :year
        `;
        const existingResult = await sequelize.query(existingQuery, {
            replacements: { investmentId, year },
            type: QueryTypes.SELECT
        });

        if (parseInt((existingResult[0] as any).count) > 0) {
            return res.status(400).json({ error: '該投資項目的分潤項目已存在，請勿重複生成' });
        }

        // 獲取投資項目資訊
        const investmentQuery = 'SELECT * FROM investments WHERE id = :investmentId';
        const investmentResult = await sequelize.query(investmentQuery, {
            replacements: { investmentId },
            type: QueryTypes.SELECT
        });

        if (investmentResult.length === 0) {
            return res.status(404).json({ error: '找不到投資項目' });
        }

        const investment = investmentResult[0] as any;

        if (!investment.userId) {
            return res.status(400).json({ error: '投資項目未指定所屬會員' });
        }

        // 獲取該年度的租金收款項目
        const rentalQuery = `
            SELECT * FROM rental_payments 
            WHERE "investmentId" = :investmentId AND year = :year
            ORDER BY month
        `;
        const rentalResult = await sequelize.query(rentalQuery, {
            replacements: { investmentId, year },
            type: QueryTypes.SELECT
        });

        if (rentalResult.length === 0) {
            return res.status(400).json({ error: '未找到該投資項目的租金收款項目' });
        }

        // 獲取分潤標準
        const standardQuery = `
            SELECT * FROM profit_sharing_standards 
            WHERE "investmentId" = :investmentId
            ORDER BY "startDate"
        `;
        const standardResult = await sequelize.query(standardQuery, {
            replacements: { investmentId },
            type: QueryTypes.SELECT
        });

        if (standardResult.length === 0) {
            return res.status(400).json({ error: '未設定分潤標準' });
        }

        const standards = standardResult;
        const rentalPayments = rentalResult;

        // 生成分潤項目
        const insertQuery = `
            INSERT INTO member_profits (
                "investmentId", "memberId", year, month, amount, 
                status, "paymentDate", note, 
                "createdAt", "updatedAt"
            ) VALUES (
                :investmentId, :memberId, :year, :month, :amount, 
                'pending', null, :note, NOW(), NOW()
            )
        `;

        let generatedCount = 0;

        for (const standard of standards) {
            const startDate = new Date((standard as any).startDate);
            const endDate = (standard as any).endDate ? new Date((standard as any).endDate) : new Date(year, 11, 31);

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
                if ((standard as any).type === 'FIXED_AMOUNT') {
                    amount = parseFloat((standard as any).value);
                } else if ((standard as any).type === 'PERCENTAGE') {
                    amount = (rentalPayment as any).amount * (parseFloat((standard as any).value) / 100);
                }

                // 插入分潤項目
                await sequelize.query(insertQuery, {
                    replacements: {
                        investmentId,
                        memberId: investment.userId,
                        year,
                        month,
                        amount,
                        note: `基於分潤標準 ${(standard as any).id} 生成`,
                    },
                    type: QueryTypes.INSERT
                });

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

        const investments = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        res.json(investments);
    } catch (error) {
        console.error('獲取可用於生成分潤的投資項目失敗:', error);
        res.status(500).json({ error: '獲取可用於生成分潤的投資項目失敗' });
    }
});

// 清除會員分潤項目
router.delete('/clear', async (req, res) => {
    try {
        const { year, month } = req.query;

        let query = 'DELETE FROM member_profits WHERE 1=1';
        const replacements: any = {};

        if (year) {
            query += ` AND year = :year`;
            replacements.year = year;
        }

        if (month) {
            query += ` AND month = :month`;
            replacements.month = month;
        }

        const result = await sequelize.query(query, {
            replacements,
            type: QueryTypes.DELETE
        });

        res.json({
            message: `成功清除 ${result[1]} 筆會員分潤項目`,
            deletedCount: result[1]
        });

    } catch (error) {
        console.error('清除會員分潤項目失敗:', error);
        res.status(500).json({ error: '清除會員分潤項目失敗' });
    }
});

export default router; 