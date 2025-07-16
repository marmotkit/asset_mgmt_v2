"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("../db/connection"));
const router = express_1.default.Router();
// 取得日記帳列表（支援分頁和篩選）
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate, accountId, categoryId, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const conditions = [];
        const bindParams = [];
        // 日期範圍篩選
        if (startDate) {
            conditions.push('j.journal_date >= $' + (bindParams.length + 1));
            bindParams.push(startDate);
        }
        if (endDate) {
            conditions.push('j.journal_date <= $' + (bindParams.length + 1));
            bindParams.push(endDate);
        }
        // 科目篩選
        if (accountId) {
            conditions.push('(j.debit_account_id = $' + (bindParams.length + 1) + ' OR j.credit_account_id = $' + (bindParams.length + 1) + ')');
            bindParams.push(accountId);
        }
        // 類別篩選
        if (categoryId) {
            conditions.push('j.category_id = $' + (bindParams.length + 1));
            bindParams.push(categoryId);
        }
        // 搜尋條件
        if (search) {
            conditions.push('(j.description ILIKE $' + (bindParams.length + 1) + ' OR j.journal_number ILIKE $' + (bindParams.length + 1) + ' OR j.reference_number ILIKE $' + (bindParams.length + 1) + ')');
            bindParams.push(`%${search}%`);
        }
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        // 取得總數
        const [countResult] = await connection_1.default.query(`
            SELECT COUNT(*) as total
            FROM accounting_journal j
            ${whereClause}
        `, { bind: bindParams });
        const total = parseInt(countResult[0].total);
        // 取得資料
        const [journals] = await connection_1.default.query(`
            SELECT 
                j.id, j.journal_date, j.journal_number, j.reference_number,
                j.description, j.amount, j.created_by, j.created_at, j.updated_at,
                da.account_code as debit_account_code,
                da.account_name as debit_account_name,
                ca.account_code as credit_account_code,
                ca.account_name as credit_account_name,
                c.category_code, c.category_name
            FROM accounting_journal j
            LEFT JOIN accounting_accounts da ON j.debit_account_id = da.id
            LEFT JOIN accounting_accounts ca ON j.credit_account_id = ca.id
            LEFT JOIN accounting_categories c ON j.category_id = c.id
            ${whereClause}
            ORDER BY j.journal_date DESC, j.created_at DESC
            LIMIT $${bindParams.length + 1} OFFSET $${bindParams.length + 2}
        `, { bind: [...bindParams, Number(limit), offset] });
        res.json({
            journals,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('取得日記帳時發生錯誤:', error);
        res.status(500).json({ error: '取得日記帳失敗' });
    }
});
// 取得單一日記帳
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [journals] = await connection_1.default.query(`
            SELECT 
                j.id, j.journal_date, j.journal_number, j.reference_number,
                j.description, j.amount, j.created_by, j.created_at, j.updated_at,
                j.debit_account_id, j.credit_account_id, j.category_id,
                da.account_code as debit_account_code,
                da.account_name as debit_account_name,
                ca.account_code as credit_account_code,
                ca.account_name as credit_account_name,
                c.category_code, c.category_name
            FROM accounting_journal j
            LEFT JOIN accounting_accounts da ON j.debit_account_id = da.id
            LEFT JOIN accounting_accounts ca ON j.credit_account_id = ca.id
            LEFT JOIN accounting_categories c ON j.category_id = c.id
            WHERE j.id = $1
        `, { bind: [id] });
        if (journals.length === 0) {
            return res.status(404).json({ error: '日記帳不存在' });
        }
        res.json(journals[0]);
    }
    catch (error) {
        console.error('取得日記帳時發生錯誤:', error);
        res.status(500).json({ error: '取得日記帳失敗' });
    }
});
// 建立新日記帳
router.post('/', async (req, res) => {
    try {
        const { journal_date, journal_number, reference_number, description, debit_account_id, credit_account_id, amount, category_id, created_by } = req.body;
        // 驗證必填欄位
        if (!journal_date || !journal_number || !description || !debit_account_id || !credit_account_id || !amount || !created_by) {
            return res.status(400).json({ error: '所有必填欄位都必須提供' });
        }
        // 檢查金額是否為正數
        if (amount <= 0) {
            return res.status(400).json({ error: '金額必須大於零' });
        }
        // 檢查科目是否存在
        const [accounts] = await connection_1.default.query(`
            SELECT id FROM accounting_accounts 
            WHERE id IN ($1, $2) AND is_active = true
        `, { bind: [debit_account_id, credit_account_id] });
        if (accounts.length !== 2) {
            return res.status(400).json({ error: '借貸科目不存在或已停用' });
        }
        // 檢查日記帳號是否已存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_journal WHERE journal_number = $1
        `, { bind: [journal_number] });
        if (existing.length > 0) {
            return res.status(400).json({ error: '日記帳號已存在' });
        }
        const [result] = await connection_1.default.query(`
            INSERT INTO accounting_journal (
                journal_date, journal_number, reference_number, description,
                debit_account_id, credit_account_id, amount, category_id, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, journal_date, journal_number, reference_number,
                      description, amount, created_by, created_at, updated_at
        `, {
            bind: [journal_date, journal_number, reference_number || null, description,
                debit_account_id, credit_account_id, amount, category_id || null, created_by]
        });
        res.status(201).json(result[0]);
    }
    catch (error) {
        console.error('建立日記帳時發生錯誤:', error);
        res.status(500).json({ error: '建立日記帳失敗' });
    }
});
// 更新日記帳
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { journal_date, journal_number, reference_number, description, debit_account_id, credit_account_id, amount, category_id } = req.body;
        // 檢查日記帳是否存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_journal WHERE id = $1
        `, { bind: [id] });
        if (existing.length === 0) {
            return res.status(404).json({ error: '日記帳不存在' });
        }
        // 檢查日記帳號是否已被其他記錄使用
        if (journal_number) {
            const [duplicate] = await connection_1.default.query(`
                SELECT id FROM accounting_journal 
                WHERE journal_number = $1 AND id != $2
            `, { bind: [journal_number, id] });
            if (duplicate.length > 0) {
                return res.status(400).json({ error: '日記帳號已被其他記錄使用' });
            }
        }
        // 檢查科目是否存在
        if (debit_account_id && credit_account_id) {
            const [accounts] = await connection_1.default.query(`
                SELECT id FROM accounting_accounts 
                WHERE id IN ($1, $2) AND is_active = true
            `, { bind: [debit_account_id, credit_account_id] });
            if (accounts.length !== 2) {
                return res.status(400).json({ error: '借貸科目不存在或已停用' });
            }
        }
        const [result] = await connection_1.default.query(`
            UPDATE accounting_journal 
            SET 
                journal_date = COALESCE($2, journal_date),
                journal_number = COALESCE($3, journal_number),
                reference_number = $4,
                description = COALESCE($5, description),
                debit_account_id = COALESCE($6, debit_account_id),
                credit_account_id = COALESCE($7, credit_account_id),
                amount = COALESCE($8, amount),
                category_id = $9,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, journal_date, journal_number, reference_number,
                      description, amount, created_by, created_at, updated_at
        `, {
            bind: [id, journal_date, journal_number, reference_number || null, description,
                debit_account_id, credit_account_id, amount, category_id || null]
        });
        res.json(result[0]);
    }
    catch (error) {
        console.error('更新日記帳時發生錯誤:', error);
        res.status(500).json({ error: '更新日記帳失敗' });
    }
});
// 刪除日記帳
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 檢查日記帳是否存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_journal WHERE id = $1
        `, { bind: [id] });
        if (existing.length === 0) {
            return res.status(404).json({ error: '日記帳不存在' });
        }
        await connection_1.default.query(`
            DELETE FROM accounting_journal WHERE id = $1
        `, { bind: [id] });
        res.json({ message: '日記帳已刪除' });
    }
    catch (error) {
        console.error('刪除日記帳時發生錯誤:', error);
        res.status(500).json({ error: '刪除日記帳失敗' });
    }
});
// 取得日記帳統計資料
router.get('/stats/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const conditions = [];
        const bindParams = [];
        if (startDate) {
            conditions.push('journal_date >= $' + (bindParams.length + 1));
            bindParams.push(startDate);
        }
        if (endDate) {
            conditions.push('journal_date <= $' + (bindParams.length + 1));
            bindParams.push(endDate);
        }
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const [stats] = await connection_1.default.query(`
            SELECT 
                COUNT(*) as total_entries,
                SUM(amount) as total_amount,
                MIN(journal_date) as first_date,
                MAX(journal_date) as last_date
            FROM accounting_journal
            ${whereClause}
        `, { bind: bindParams });
        res.json(stats[0]);
    }
    catch (error) {
        console.error('取得日記帳統計時發生錯誤:', error);
        res.status(500).json({ error: '取得統計資料失敗' });
    }
});
// 取得科目餘額
router.get('/accounts/balance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const conditions = [];
        const bindParams = [];
        if (startDate) {
            conditions.push('j.journal_date >= $' + (bindParams.length + 1));
            bindParams.push(startDate);
        }
        if (endDate) {
            conditions.push('j.journal_date <= $' + (bindParams.length + 1));
            bindParams.push(endDate);
        }
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const [balances] = await connection_1.default.query(`
            SELECT 
                a.id,
                a.account_code,
                a.account_name,
                a.account_type,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN j.debit_account_id = a.id THEN j.amount ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN j.credit_account_id = a.id THEN j.amount ELSE 0 END), 0) as balance
            FROM accounting_accounts a
            LEFT JOIN accounting_journal j ON (a.id = j.debit_account_id OR a.id = j.credit_account_id)
            ${whereClause}
            WHERE a.is_active = true
            GROUP BY a.id, a.account_code, a.account_name, a.account_type
            ORDER BY a.account_code
        `, { bind: bindParams });
        res.json(balances);
    }
    catch (error) {
        console.error('取得科目餘額時發生錯誤:', error);
        res.status(500).json({ error: '取得科目餘額失敗' });
    }
});
exports.default = router;
