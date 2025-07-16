"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = __importDefault(require("../db/connection"));
const router = express_1.default.Router();
// 取得所有交易類別
router.get('/', async (req, res) => {
    try {
        const [categories] = await connection_1.default.query(`
            SELECT 
                id, category_code, category_name, category_type, 
                description, is_active, created_at, updated_at
            FROM accounting_categories 
            WHERE is_active = true
            ORDER BY category_code
        `);
        res.json(categories);
    }
    catch (error) {
        console.error('取得交易類別時發生錯誤:', error);
        res.status(500).json({ error: '取得交易類別失敗' });
    }
});
// 取得單一交易類別
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await connection_1.default.query(`
            SELECT 
                id, category_code, category_name, category_type, 
                description, is_active, created_at, updated_at
            FROM accounting_categories 
            WHERE id = $1
        `, { bind: [id] });
        if (categories.length === 0) {
            return res.status(404).json({ error: '交易類別不存在' });
        }
        res.json(categories[0]);
    }
    catch (error) {
        console.error('取得交易類別時發生錯誤:', error);
        res.status(500).json({ error: '取得交易類別失敗' });
    }
});
// 建立新交易類別
router.post('/', async (req, res) => {
    try {
        const { category_code, category_name, category_type, description } = req.body;
        // 驗證必填欄位
        if (!category_code || !category_name || !category_type) {
            return res.status(400).json({ error: '類別代碼、類別名稱和類別類型為必填欄位' });
        }
        // 檢查類別代碼是否已存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_categories WHERE category_code = $1
        `, { bind: [category_code] });
        if (existing.length > 0) {
            return res.status(400).json({ error: '類別代碼已存在' });
        }
        const [result] = await connection_1.default.query(`
            INSERT INTO accounting_categories (
                category_code, category_name, category_type, description, is_active
            ) VALUES ($1, $2, $3, $4, true)
            RETURNING id, category_code, category_name, category_type, 
                      description, is_active, created_at, updated_at
        `, {
            bind: [category_code, category_name, category_type, description || null]
        });
        res.status(201).json(result[0]);
    }
    catch (error) {
        console.error('建立交易類別時發生錯誤:', error);
        res.status(500).json({ error: '建立交易類別失敗' });
    }
});
// 更新交易類別
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_code, category_name, category_type, description, is_active } = req.body;
        // 檢查類別是否存在
        const [existing] = await connection_1.default.query(`
            SELECT id FROM accounting_categories WHERE id = $1
        `, { bind: [id] });
        if (existing.length === 0) {
            return res.status(404).json({ error: '交易類別不存在' });
        }
        // 檢查類別代碼是否已被其他類別使用
        if (category_code) {
            const [duplicate] = await connection_1.default.query(`
                SELECT id FROM accounting_categories 
                WHERE category_code = $1 AND id != $2
            `, { bind: [category_code, id] });
            if (duplicate.length > 0) {
                return res.status(400).json({ error: '類別代碼已被其他類別使用' });
            }
        }
        const [result] = await connection_1.default.query(`
            UPDATE accounting_categories 
            SET 
                category_code = COALESCE($2, category_code),
                category_name = COALESCE($3, category_name),
                category_type = COALESCE($4, category_type),
                description = $5,
                is_active = COALESCE($6, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, category_code, category_name, category_type, 
                      description, is_active, created_at, updated_at
        `, {
            bind: [id, category_code, category_name, category_type, description || null, is_active]
        });
        res.json(result[0]);
    }
    catch (error) {
        console.error('更新交易類別時發生錯誤:', error);
        res.status(500).json({ error: '更新交易類別失敗' });
    }
});
// 刪除交易類別（軟刪除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // 檢查是否在日記帳中使用
        const [journalUsage] = await connection_1.default.query(`
            SELECT id FROM accounting_journal WHERE category_id = $1
        `, { bind: [id] });
        if (journalUsage.length > 0) {
            return res.status(400).json({ error: '無法刪除已在日記帳中使用的交易類別' });
        }
        await connection_1.default.query(`
            UPDATE accounting_categories 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, { bind: [id] });
        res.json({ message: '交易類別已刪除' });
    }
    catch (error) {
        console.error('刪除交易類別時發生錯誤:', error);
        res.status(500).json({ error: '刪除交易類別失敗' });
    }
});
// 根據類型取得交易類別
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const [categories] = await connection_1.default.query(`
            SELECT 
                id, category_code, category_name, category_type, 
                description, is_active
            FROM accounting_categories 
            WHERE category_type = $1 AND is_active = true
            ORDER BY category_code
        `, { bind: [type] });
        res.json(categories);
    }
    catch (error) {
        console.error('根據類型取得交易類別時發生錯誤:', error);
        res.status(500).json({ error: '取得交易類別失敗' });
    }
});
exports.default = router;
