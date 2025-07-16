"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("../db/connection"));
const router = express_1.default.Router();
// 取得所有會計科目
router.get('/', async (req, res) => {
    try {
        const [accounts] = await connection_1.default.query(`
            SELECT 
                id, account_code, account_name, account_type, 
                parent_account_id, description, is_active,
                created_at, updated_at
            FROM accounting_accounts 
            WHERE is_active = true
            ORDER BY account_code
        `);
        res.json(accounts);
    }
    catch (error) {
        console.error('取得會計科目時發生錯誤:', error);
        res.status(500).json({ error: '取得會計科目失敗' });
    }
});
// 取得單一會計科目
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [accounts] = await connection_1.default.query(`
            SELECT 
                id, account_code, account_name, account_type, 
                parent_account_id, description, is_active,
                created_at, updated_at
            FROM accounting_accounts 
            WHERE id = $1
        `, { bind: [id] });
        if (accounts.length === 0) {
            return res.status(404).json({ error: '會計科目不存在' });
        }
        res.json(accounts[0]);
    }
    catch (error) {
        console.error('取得會計科目時發生錯誤:', error);
        res.status(500).json({ error: '取得會計科目失敗' });
    }
});
// 建立新會計科目
router.post('/', async (req, res) => {
    try {
        const { account_code, account_name, account_type, parent_account_id, description } = req.body;
        // 驗證必填欄位
        if (!account_code || !account_name || !account_type) {
            return res.status(400).json({ error: '科目代碼、科目名稱和科目類型為必填欄位' });
        }
        // 檢查科目代碼是否已存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_accounts WHERE account_code = $1
        `, { bind: [account_code] });
        if (existing.length > 0) {
            return res.status(400).json({ error: '科目代碼已存在' });
        }
        const [result] = await connection_1.default.query(`
            INSERT INTO accounting_accounts (
                account_code, account_name, account_type, 
                parent_account_id, description, is_active
            ) VALUES ($1, $2, $3, $4, $5, true)
            RETURNING id, account_code, account_name, account_type, 
                      parent_account_id, description, is_active,
                      created_at, updated_at
        `, {
            bind: [account_code, account_name, account_type, parent_account_id || null, description || null]
        });
        res.status(201).json(result[0]);
    }
    catch (error) {
        console.error('建立會計科目時發生錯誤:', error);
        res.status(500).json({ error: '建立會計科目失敗' });
    }
});
// 更新會計科目
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { account_code, account_name, account_type, parent_account_id, description, is_active } = req.body;
        // 檢查科目是否存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_accounts WHERE id = $1
        `, { bind: [id] });
        if (existing.length === 0) {
            return res.status(404).json({ error: '會計科目不存在' });
        }
        // 檢查科目代碼是否已被其他科目使用
        if (account_code) {
            const [duplicate] = await connection_1.default.query(`
                SELECT id FROM accounting_accounts 
                WHERE account_code = $1 AND id != $2
            `, { bind: [account_code, id] });
            if (duplicate.length > 0) {
                return res.status(400).json({ error: '科目代碼已被其他科目使用' });
            }
        }
        const [result] = await connection_1.default.query(`
            UPDATE accounting_accounts 
            SET 
                account_code = COALESCE($2, account_code),
                account_name = COALESCE($3, account_name),
                account_type = COALESCE($4, account_type),
                parent_account_id = $5,
                description = $6,
                is_active = COALESCE($7, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, account_code, account_name, account_type, 
                      parent_account_id, description, is_active,
                      created_at, updated_at
        `, {
            bind: [id, account_code, account_name, account_type, parent_account_id || null, description || null, is_active]
        });
        res.json(result[0]);
    }
    catch (error) {
        console.error('更新會計科目時發生錯誤:', error);
        res.status(500).json({ error: '更新會計科目失敗' });
    }
});
// 刪除會計科目（軟刪除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 檢查是否有子科目
        const [children] = await connection_1.default.query(`
            SELECT id FROM accounting_accounts WHERE parent_account_id = $1 AND is_active = true
        `, { bind: [id] });
        if (children.length > 0) {
            return res.status(400).json({ error: '無法刪除有子科目的會計科目' });
        }
        // 檢查是否在日記帳中使用
        const [journalUsage] = await connection_1.default.query(`
            SELECT id FROM accounting_journal 
            WHERE debit_account_id = $1 OR credit_account_id = $1
        `, { bind: [id] });
        if (journalUsage.length > 0) {
            return res.status(400).json({ error: '無法刪除已在日記帳中使用的會計科目' });
        }
        await connection_1.default.query(`
            UPDATE accounting_accounts 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, { bind: [id] });
        res.json({ message: '會計科目已刪除' });
    }
    catch (error) {
        console.error('刪除會計科目時發生錯誤:', error);
        res.status(500).json({ error: '刪除會計科目失敗' });
    }
});
// 取得科目樹狀結構
router.get('/tree/structure', async (req, res) => {
    try {
        const [accounts] = await connection_1.default.query(`
            SELECT 
                id, account_code, account_name, account_type, 
                parent_account_id, description, is_active
            FROM accounting_accounts 
            WHERE is_active = true
            ORDER BY account_code
        `);
        // 建立樹狀結構
        const buildTree = (parentId = null) => {
            return accounts
                .filter((account) => account.parent_account_id === parentId)
                .map((account) => ({
                ...account,
                children: buildTree(account.id)
            }));
        };
        const tree = buildTree();
        res.json(tree);
    }
    catch (error) {
        console.error('取得科目樹狀結構時發生錯誤:', error);
        res.status(500).json({ error: '取得科目樹狀結構失敗' });
    }
});
exports.default = router;
