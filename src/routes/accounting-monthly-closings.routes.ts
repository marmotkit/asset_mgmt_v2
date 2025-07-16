import express from 'express';
import sequelize from '../db/connection';

const router = express.Router();

// 取得月結記錄列表
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            year,
            month,
            status
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const conditions = [];
        const bindParams = [];

        // 年度篩選
        if (year) {
            conditions.push('closing_year = $' + (bindParams.length + 1));
            bindParams.push(year);
        }

        // 月份篩選
        if (month) {
            conditions.push('closing_month = $' + (bindParams.length + 1));
            bindParams.push(month);
        }

        // 狀態篩選
        if (status) {
            conditions.push('status = $' + (bindParams.length + 1));
            bindParams.push(status);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // 取得總數
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM accounting_monthly_closings
            ${whereClause}
        `, { bind: bindParams });

        const total = parseInt((countResult[0] as any).total);

        // 取得資料
        const [closings] = await sequelize.query(`
            SELECT 
                id, closing_year, closing_month, closing_date,
                total_debit, total_credit, balance, status,
                closed_by, closed_at, notes, created_at, updated_at
            FROM accounting_monthly_closings
            ${whereClause}
            ORDER BY closing_year DESC, closing_month DESC
            LIMIT $${bindParams.length + 1} OFFSET $${bindParams.length + 2}
        `, { bind: [...bindParams, Number(limit), offset] });

        res.json({
            closings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('取得月結記錄時發生錯誤:', error);
        res.status(500).json({ error: '取得月結記錄失敗' });
    }
});

// 取得單一月結記錄
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [closings] = await sequelize.query(`
            SELECT 
                id, closing_year, closing_month, closing_date,
                total_debit, total_credit, balance, status,
                closed_by, closed_at, notes, created_at, updated_at
            FROM accounting_monthly_closings
            WHERE id = $1
        `, { bind: [id] });

        if (closings.length === 0) {
            return res.status(404).json({ error: '月結記錄不存在' });
        }

        res.json(closings[0]);
    } catch (error) {
        console.error('取得月結記錄時發生錯誤:', error);
        res.status(500).json({ error: '取得月結記錄失敗' });
    }
});

// 執行月結
router.post('/close', async (req, res) => {
    try {
        const {
            closing_year,
            closing_month,
            closed_by,
            notes
        } = req.body;

        // 驗證必填欄位
        if (!closing_year || !closing_month || !closed_by) {
            return res.status(400).json({ error: '年度、月份和結帳人員為必填欄位' });
        }

        // 檢查是否已存在該年月的月結記錄
        const [existing] = await sequelize.query(`
            SELECT id FROM accounting_monthly_closings 
            WHERE closing_year = $1 AND closing_month = $2
        `, { bind: [closing_year, closing_month] });

        if (existing.length > 0) {
            return res.status(400).json({ error: '該年月的月結記錄已存在' });
        }

        // 計算該月份的日記帳總額
        const [journalStats] = await sequelize.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_debit,
                COALESCE(SUM(amount), 0) as total_credit
            FROM accounting_journal
            WHERE EXTRACT(YEAR FROM journal_date) = $1 
            AND EXTRACT(MONTH FROM journal_date) = $2
        `, { bind: [closing_year, closing_month] });

        const totalDebit = parseFloat((journalStats[0] as any).total_debit);
        const totalCredit = parseFloat((journalStats[0] as any).total_credit);
        const balance = totalDebit - totalCredit;

        // 檢查借貸是否平衡
        if (Math.abs(balance) > 0.01) {
            return res.status(400).json({
                error: '借貸不平衡，無法執行月結',
                details: {
                    totalDebit,
                    totalCredit,
                    balance
                }
            });
        }

        // 建立月結記錄
        const [result] = await sequelize.query(`
            INSERT INTO accounting_monthly_closings (
                closing_year, closing_month, closing_date,
                total_debit, total_credit, balance, status,
                closed_by, closed_at, notes
            ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, 'closed', $6, CURRENT_TIMESTAMP, $7)
            RETURNING id, closing_year, closing_month, closing_date,
                      total_debit, total_credit, balance, status,
                      closed_by, closed_at, notes, created_at, updated_at
        `, {
            bind: [closing_year, closing_month, totalDebit, totalCredit, balance, closed_by, notes || null]
        });

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('執行月結時發生錯誤:', error);
        res.status(500).json({ error: '執行月結失敗' });
    }
});

// 更新月結記錄
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            notes,
            status
        } = req.body;

        // 檢查月結記錄是否存在
        const [existing] = await sequelize.query(`
            SELECT id, status FROM accounting_monthly_closings WHERE id = $1
        `, { bind: [id] });

        if (existing.length === 0) {
            return res.status(404).json({ error: '月結記錄不存在' });
        }

        // 如果已結帳，只允許修改備註
        if ((existing[0] as any).status === 'closed' && status && status !== 'closed') {
            return res.status(400).json({ error: '已結帳的記錄無法修改狀態' });
        }

        const [result] = await sequelize.query(`
            UPDATE accounting_monthly_closings 
            SET 
                notes = COALESCE($2, notes),
                status = COALESCE($3, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, closing_year, closing_month, closing_date,
                      total_debit, total_credit, balance, status,
                      closed_by, closed_at, notes, created_at, updated_at
        `, {
            bind: [id, notes || null, status || null]
        });

        res.json(result[0]);
    } catch (error) {
        console.error('更新月結記錄時發生錯誤:', error);
        res.status(500).json({ error: '更新月結記錄失敗' });
    }
});

// 刪除月結記錄
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 檢查月結記錄是否存在
        const [existing] = await sequelize.query(`
            SELECT id, status FROM accounting_monthly_closings WHERE id = $1
        `, { bind: [id] });

        if (existing.length === 0) {
            return res.status(404).json({ error: '月結記錄不存在' });
        }

        // 如果已結帳，不允許刪除
        if ((existing[0] as any).status === 'closed') {
            return res.status(400).json({ error: '已結帳的記錄無法刪除' });
        }

        await sequelize.query(`
            DELETE FROM accounting_monthly_closings WHERE id = $1
        `, { bind: [id] });

        res.json({ message: '月結記錄已刪除' });
    } catch (error) {
        console.error('刪除月結記錄時發生錯誤:', error);
        res.status(500).json({ error: '刪除月結記錄失敗' });
    }
});

// 取得月結統計
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_count,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
                COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
                SUM(total_debit) as total_debit,
                SUM(total_credit) as total_credit,
                SUM(balance) as total_balance
            FROM accounting_monthly_closings
        `);

        res.json(stats[0]);
    } catch (error) {
        console.error('取得月結統計時發生錯誤:', error);
        res.status(500).json({ error: '取得統計資料失敗' });
    }
});

// 取得指定年度的月結記錄
router.get('/year/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const [closings] = await sequelize.query(`
            SELECT 
                id, closing_year, closing_month, closing_date,
                total_debit, total_credit, balance, status,
                closed_by, closed_at, notes
            FROM accounting_monthly_closings
            WHERE closing_year = $1
            ORDER BY closing_month ASC
        `, { bind: [year] });

        res.json(closings);
    } catch (error) {
        console.error('取得年度月結記錄時發生錯誤:', error);
        res.status(500).json({ error: '取得年度月結記錄失敗' });
    }
});

// 檢查指定年月是否可以月結
router.get('/check/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;

        // 檢查是否已存在該年月的月結記錄
        const [existing] = await sequelize.query(`
            SELECT id FROM accounting_monthly_closings 
            WHERE closing_year = $1 AND closing_month = $2
        `, { bind: [year, month] });

        if (existing.length > 0) {
            return res.json({
                canClose: false,
                reason: '該年月的月結記錄已存在'
            });
        }

        // 計算該月份的日記帳總額
        const [journalStats] = await sequelize.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_debit,
                COALESCE(SUM(amount), 0) as total_credit,
                COUNT(*) as entry_count
            FROM accounting_journal
            WHERE EXTRACT(YEAR FROM journal_date) = $1 
            AND EXTRACT(MONTH FROM journal_date) = $2
        `, { bind: [year, month] });

        const totalDebit = parseFloat((journalStats[0] as any).total_debit);
        const totalCredit = parseFloat((journalStats[0] as any).total_credit);
        const entryCount = parseInt((journalStats[0] as any).entry_count);
        const balance = totalDebit - totalCredit;

        res.json({
            canClose: Math.abs(balance) <= 0.01 && entryCount > 0,
            details: {
                totalDebit,
                totalCredit,
                balance,
                entryCount,
                reason: Math.abs(balance) > 0.01 ? '借貸不平衡' : entryCount === 0 ? '無日記帳記錄' : null
            }
        });
    } catch (error) {
        console.error('檢查月結條件時發生錯誤:', error);
        res.status(500).json({ error: '檢查月結條件失敗' });
    }
});

export default router; 