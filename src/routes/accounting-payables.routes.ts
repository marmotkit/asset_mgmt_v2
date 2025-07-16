import express from 'express';
import sequelize from '../db/connection';

const router = express.Router();

// 取得應付帳款列表
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            supplierId,
            startDate,
            endDate,
            search
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const conditions = [];
        const bindParams = [];

        // 狀態篩選
        if (status) {
            conditions.push('status = $' + (bindParams.length + 1));
            bindParams.push(status);
        }

        // 供應商篩選
        if (supplierId) {
            conditions.push('supplier_id = $' + (bindParams.length + 1));
            bindParams.push(supplierId);
        }

        // 日期範圍篩選
        if (startDate) {
            conditions.push('due_date >= $' + (bindParams.length + 1));
            bindParams.push(startDate);
        }
        if (endDate) {
            conditions.push('due_date <= $' + (bindParams.length + 1));
            bindParams.push(endDate);
        }

        // 搜尋條件
        if (search) {
            conditions.push('(supplier_name ILIKE $' + (bindParams.length + 1) + ' OR invoice_number ILIKE $' + (bindParams.length + 1) + ' OR description ILIKE $' + (bindParams.length + 1) + ')');
            bindParams.push(`%${search}%`);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // 取得總數
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total
            FROM accounting_payables
            ${whereClause}
        `, { bind: bindParams });

        const total = parseInt((countResult[0] as any).total);

        // 取得資料
        const [payables] = await sequelize.query(`
            SELECT 
                id, supplier_id, supplier_name, invoice_number, amount,
                due_date, status, payment_date, payment_amount, remaining_amount,
                description, created_at, updated_at
            FROM accounting_payables
            ${whereClause}
            ORDER BY due_date ASC, created_at DESC
            LIMIT $${bindParams.length + 1} OFFSET $${bindParams.length + 2}
        `, { bind: [...bindParams, Number(limit), offset] });

        res.json({
            payables,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('取得應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '取得應付帳款失敗' });
    }
});

// 取得單一應付帳款
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [payables] = await sequelize.query(`
            SELECT 
                id, supplier_id, supplier_name, invoice_number, amount,
                due_date, status, payment_date, payment_amount, remaining_amount,
                description, created_at, updated_at
            FROM accounting_payables
            WHERE id = $1
        `, { bind: [id] });

        if (payables.length === 0) {
            return res.status(404).json({ error: '應付帳款不存在' });
        }

        res.json(payables[0]);
    } catch (error) {
        console.error('取得應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '取得應付帳款失敗' });
    }
});

// 建立新應付帳款
router.post('/', async (req, res) => {
    try {
        const {
            supplier_id,
            supplier_name,
            invoice_number,
            amount,
            due_date,
            description
        } = req.body;

        // 驗證必填欄位
        if (!supplier_id || !supplier_name || !amount || !due_date) {
            return res.status(400).json({ error: '供應商ID、供應商名稱、金額和到期日為必填欄位' });
        }

        // 檢查金額是否為正數
        if (amount <= 0) {
            return res.status(400).json({ error: '金額必須大於零' });
        }

        const [result] = await sequelize.query(`
            INSERT INTO accounting_payables (
                supplier_id, supplier_name, invoice_number, amount,
                due_date, status, remaining_amount, description
            ) VALUES ($1, $2, $3, $4, $5, 'pending', $4, $6)
            RETURNING id, supplier_id, supplier_name, invoice_number, amount,
                      due_date, status, remaining_amount, description,
                      created_at, updated_at
        `, {
            bind: [supplier_id, supplier_name, invoice_number || null, amount, due_date, description || null]
        });

        res.status(201).json(result[0]);
    } catch (error) {
        console.error('建立應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '建立應付帳款失敗' });
    }
});

// 更新應付帳款
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            supplier_id,
            supplier_name,
            invoice_number,
            amount,
            due_date,
            description
        } = req.body;

        // 檢查應付帳款是否存在
        const [existing] = await sequelize.query(`
            SELECT id, status FROM accounting_payables WHERE id = $1
        `, { bind: [id] });

        if (existing.length === 0) {
            return res.status(404).json({ error: '應付帳款不存在' });
        }

        // 如果已付款，不允許修改
        if ((existing[0] as any).status === 'paid') {
            return res.status(400).json({ error: '已付款的應付帳款無法修改' });
        }

        const [result] = await sequelize.query(`
            UPDATE accounting_payables 
            SET 
                supplier_id = COALESCE($2, supplier_id),
                supplier_name = COALESCE($3, supplier_name),
                invoice_number = $4,
                amount = COALESCE($5, amount),
                due_date = COALESCE($6, due_date),
                remaining_amount = COALESCE($5, amount),
                description = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, supplier_id, supplier_name, invoice_number, amount,
                      due_date, status, remaining_amount, description,
                      created_at, updated_at
        `, {
            bind: [id, supplier_id, supplier_name, invoice_number || null, amount, due_date, description || null]
        });

        res.json(result[0]);
    } catch (error) {
        console.error('更新應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '更新應付帳款失敗' });
    }
});

// 記錄付款
router.post('/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            payment_amount,
            payment_date
        } = req.body;

        // 驗證必填欄位
        if (!payment_amount || !payment_date) {
            return res.status(400).json({ error: '付款金額和付款日期為必填欄位' });
        }

        // 檢查應付帳款是否存在
        const [existing] = await sequelize.query(`
            SELECT id, amount, remaining_amount, status FROM accounting_payables WHERE id = $1
        `, { bind: [id] });

        if (existing.length === 0) {
            return res.status(404).json({ error: '應付帳款不存在' });
        }

        const payable = existing[0] as any;

        // 檢查付款金額
        if (payment_amount <= 0) {
            return res.status(400).json({ error: '付款金額必須大於零' });
        }

        if (payment_amount > payable.remaining_amount) {
            return res.status(400).json({ error: '付款金額不能超過剩餘金額' });
        }

        // 計算新的剩餘金額
        const newRemainingAmount = payable.remaining_amount - payment_amount;
        const newStatus = newRemainingAmount === 0 ? 'paid' : 'partial';

        const [result] = await sequelize.query(`
            UPDATE accounting_payables 
            SET 
                payment_amount = COALESCE(payment_amount, 0) + $2,
                payment_date = $3,
                remaining_amount = $4,
                status = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, supplier_id, supplier_name, invoice_number, amount,
                      due_date, status, payment_date, payment_amount, remaining_amount,
                      description, created_at, updated_at
        `, {
            bind: [id, payment_amount, payment_date, newRemainingAmount, newStatus]
        });

        res.json(result[0]);
    } catch (error) {
        console.error('記錄付款時發生錯誤:', error);
        res.status(500).json({ error: '記錄付款失敗' });
    }
});

// 刪除應付帳款
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 檢查應付帳款是否存在
        const [existing] = await sequelize.query(`
            SELECT id, status FROM accounting_payables WHERE id = $1
        `, { bind: [id] });

        if (existing.length === 0) {
            return res.status(404).json({ error: '應付帳款不存在' });
        }

        // 如果已付款，不允許刪除
        if ((existing[0] as any).status === 'paid') {
            return res.status(400).json({ error: '已付款的應付帳款無法刪除' });
        }

        await sequelize.query(`
            DELETE FROM accounting_payables WHERE id = $1
        `, { bind: [id] });

        res.json({ message: '應付帳款已刪除' });
    } catch (error) {
        console.error('刪除應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '刪除應付帳款失敗' });
    }
});

// 取得應付帳款統計
router.get('/stats/summary', async (req, res) => {
    try {
        const { status } = req.query;
        const conditions = [];
        const bindParams = [];

        if (status) {
            conditions.push('status = $' + (bindParams.length + 1));
            bindParams.push(status);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total_count,
                SUM(amount) as total_amount,
                SUM(remaining_amount) as total_remaining,
                SUM(payment_amount) as total_paid,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_count,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count
            FROM accounting_payables
            ${whereClause}
        `, { bind: bindParams });

        res.json(stats[0]);
    } catch (error) {
        console.error('取得應付帳款統計時發生錯誤:', error);
        res.status(500).json({ error: '取得統計資料失敗' });
    }
});

// 取得逾期應付帳款
router.get('/overdue/list', async (req, res) => {
    try {
        const [overdue] = await sequelize.query(`
            SELECT 
                id, supplier_id, supplier_name, invoice_number, amount,
                due_date, status, payment_amount, remaining_amount,
                description, created_at, updated_at,
                CURRENT_DATE - due_date as days_overdue
            FROM accounting_payables
            WHERE due_date < CURRENT_DATE AND status != 'paid'
            ORDER BY due_date ASC
        `);

        res.json(overdue);
    } catch (error) {
        console.error('取得逾期應付帳款時發生錯誤:', error);
        res.status(500).json({ error: '取得逾期應付帳款失敗' });
    }
});

export default router; 