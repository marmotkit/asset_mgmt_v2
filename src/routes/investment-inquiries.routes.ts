import express from 'express';
import { db } from '../db/connection';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 取得洽詢列表 (需要認證)
router.get('/investment-inquiries', authMiddleware, async (req, res) => {
    try {
        const {
            investmentId,
            status,
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        // 投資標的篩選
        if (investmentId) {
            whereClause += ' AND investment_id = ?';
            params.push(investmentId);
        }

        // 狀態篩選
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 分頁
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        const limitClause = `LIMIT ${parseInt(limit as string)} OFFSET ${offset}`;

        // 查詢總數
        const countQuery = `SELECT COUNT(*) as total FROM investment_inquiries ${whereClause}`;
        const [countResult] = await db.query(countQuery, params);
        const total = (countResult as any[])[0].total;

        // 查詢資料
        const query = `
            SELECT i.*, o.title as investment_title 
            FROM investment_inquiries i
            LEFT JOIN investment_opportunities o ON i.investment_id = o.id
            ${whereClause} 
            ORDER BY i.created_at DESC
            ${limitClause}
        `;
        const [inquiries] = await db.query(query, params);

        res.json({
            inquiries,
            total,
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });
    } catch (error) {
        console.error('取得洽詢列表失敗:', error);
        res.status(500).json({ error: '取得洽詢列表失敗' });
    }
});

// 取得單一洽詢 (需要認證)
router.get('/investment-inquiries/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT i.*, o.title as investment_title 
            FROM investment_inquiries i
            LEFT JOIN investment_opportunities o ON i.investment_id = o.id
            WHERE i.id = ?
        `;
        const [inquiries] = await db.query(query, [id]);

        if ((inquiries as any[]).length === 0) {
            return res.status(404).json({ error: '找不到洽詢記錄' });
        }

        res.json((inquiries as any[])[0]);
    } catch (error) {
        console.error('取得洽詢失敗:', error);
        res.status(500).json({ error: '取得洽詢失敗' });
    }
});

// 建立新洽詢 (公開)
router.post('/investment-inquiries', async (req, res) => {
    try {
        const {
            investment_id,
            name,
            email,
            phone,
            company,
            investment_amount,
            message
        } = req.body;

        // 驗證必填欄位
        if (!investment_id || !name || !email) {
            return res.status(400).json({ error: '請填寫必要欄位' });
        }

        // 驗證投資標的是否存在
        const [investment] = await db.query(
            'SELECT id FROM investment_opportunities WHERE id = ? AND status = "active"',
            [investment_id]
        );

        if ((investment as any[]).length === 0) {
            return res.status(400).json({ error: '投資標的不存在或未上市' });
        }

        const id = require('crypto').randomUUID();

        const query = `
            INSERT INTO investment_inquiries (
                id, investment_id, name, email, phone, company,
                investment_amount, message, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())
        `;

        await db.query(query, [
            id, investment_id, name, email, phone || null, company || null,
            investment_amount || null, message || null
        ]);

        // 更新投資標的洽詢次數
        await db.query(
            'UPDATE investment_opportunities SET inquiry_count = inquiry_count + 1 WHERE id = ?',
            [investment_id]
        );

        // 回傳建立的洽詢
        const [newInquiry] = await db.query(
            'SELECT * FROM investment_inquiries WHERE id = ?',
            [id]
        );

        res.status(201).json((newInquiry as any[])[0]);
    } catch (error) {
        console.error('建立洽詢失敗:', error);
        res.status(500).json({ error: '建立洽詢失敗' });
    }
});

// 更新洽詢 (需要認證)
router.put('/investment-inquiries/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        // 檢查洽詢是否存在
        const [existing] = await db.query(
            'SELECT id FROM investment_inquiries WHERE id = ?',
            [id]
        );

        if ((existing as any[]).length === 0) {
            return res.status(404).json({ error: '找不到洽詢記錄' });
        }

        // 建立更新欄位
        const updateFields = [];
        const updateValues = [];

        if (status) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }

        if (admin_notes !== undefined) {
            updateFields.push('admin_notes = ?');
            updateValues.push(admin_notes);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: '沒有提供更新資料' });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const query = `
            UPDATE investment_inquiries 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        await db.query(query, updateValues);

        // 回傳更新後的洽詢
        const [updatedInquiry] = await db.query(
            'SELECT * FROM investment_inquiries WHERE id = ?',
            [id]
        );

        res.json((updatedInquiry as any[])[0]);
    } catch (error) {
        console.error('更新洽詢失敗:', error);
        res.status(500).json({ error: '更新洽詢失敗' });
    }
});

// 刪除洽詢 (需要認證)
router.delete('/investment-inquiries/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 檢查洽詢是否存在
        const [existing] = await db.query(
            'SELECT id FROM investment_inquiries WHERE id = ?',
            [id]
        );

        if ((existing as any[]).length === 0) {
            return res.status(404).json({ error: '找不到洽詢記錄' });
        }

        await db.query('DELETE FROM investment_inquiries WHERE id = ?', [id]);

        res.json({ message: '洽詢記錄已刪除' });
    } catch (error) {
        console.error('刪除洽詢失敗:', error);
        res.status(500).json({ error: '刪除洽詢失敗' });
    }
});

export default router; 