import express from 'express';
import sequelize from '../db/connection';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// 取得投資標的列表
router.get('/investment-opportunities', async (req, res) => {
    try {
        const {
            status,
            investment_type,
            risk_level,
            min_amount,
            max_amount,
            location,
            industry,
            featured,
            search,
            sortBy = 'created_at',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params: any[] = [];

        // 狀態篩選
        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 投資類型篩選
        if (investment_type) {
            whereClause += ' AND investment_type = ?';
            params.push(investment_type);
        }

        // 風險等級篩選
        if (risk_level) {
            whereClause += ' AND risk_level = ?';
            params.push(risk_level);
        }

        // 金額範圍篩選
        if (min_amount) {
            whereClause += ' AND investment_amount >= ?';
            params.push(parseFloat(min_amount as string));
        }
        if (max_amount) {
            whereClause += ' AND investment_amount <= ?';
            params.push(parseFloat(max_amount as string));
        }

        // 地區篩選
        if (location) {
            whereClause += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }

        // 產業篩選
        if (industry) {
            whereClause += ' AND industry LIKE ?';
            params.push(`%${industry}%`);
        }

        // 特色篩選
        if (featured !== undefined) {
            whereClause += ' AND featured = ?';
            params.push(featured === 'true' ? 1 : 0);
        }

        // 搜尋
        if (search) {
            whereClause += ' AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // 排序
        const orderBy = `ORDER BY ${sortBy} ${(sortOrder as string).toUpperCase()}`;

        // 分頁
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        const limitClause = `LIMIT ${parseInt(limit as string)} OFFSET ${offset}`;

        // 查詢總數
        const countQuery = `SELECT COUNT(*) as total FROM investment_opportunities ${whereClause}`;
        const [countResult] = await sequelize.query(countQuery, { replacements: params });
        const total = (countResult as any[])[0].total;

        // 查詢資料
        const query = `
            SELECT * FROM investment_opportunities 
            ${whereClause} 
            ${orderBy} 
            ${limitClause}
        `;
        const [opportunities] = await sequelize.query(query, { replacements: params });

        res.json({
            opportunities,
            total,
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });
    } catch (error) {
        console.error('取得投資標的列表失敗:', error);
        res.status(500).json({ error: '取得投資標的列表失敗' });
    }
});

// 取得單一投資標的
router.get('/investment-opportunities/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT * FROM investment_opportunities 
            WHERE id = ?
        `;
        const [opportunities] = await sequelize.query(query, { replacements: [id] });

        if ((opportunities as any[]).length === 0) {
            return res.status(404).json({ error: '找不到投資標的' });
        }

        res.json((opportunities as any[])[0]);
    } catch (error) {
        console.error('取得投資標的失敗:', error);
        res.status(500).json({ error: '取得投資標的失敗' });
    }
});

// 建立新投資標的 (需要認證)
router.post('/investment-opportunities', authMiddleware, async (req, res) => {
    try {
        const {
            title,
            subtitle,
            description,
            short_description,
            investment_amount,
            min_investment,
            max_investment,
            investment_type,
            location,
            industry,
            risk_level,
            expected_return,
            investment_period,
            status,
            featured,
            sort_order
        } = req.body;

        const id = require('crypto').randomUUID();
        const created_by = (req as any).user.id;

        const query = `
            INSERT INTO investment_opportunities (
                id, title, subtitle, description, short_description,
                investment_amount, min_investment, max_investment,
                investment_type, location, industry, risk_level,
                expected_return, investment_period, status, featured,
                sort_order, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await sequelize.query(query, {
            replacements: [
                id,
                title || '',
                subtitle || null,
                description || '',
                short_description || null,
                investment_amount || 0,
                min_investment || null,
                max_investment || null,
                investment_type || 'other',
                location || null,
                industry || null,
                risk_level || 'medium',
                expected_return || null,
                investment_period || null,
                status || 'active',
                featured || false,
                sort_order || 0,
                created_by
            ]
        });

        // 回傳建立的標的
        const [newOpportunity] = await sequelize.query(
            'SELECT * FROM investment_opportunities WHERE id = ?',
            { replacements: [id] }
        );

        res.status(201).json((newOpportunity as any[])[0]);
    } catch (error) {
        console.error('建立投資標的失敗:', error);
        res.status(500).json({ error: '建立投資標的失敗' });
    }
});

// 更新投資標的 (需要認證)
router.put('/investment-opportunities/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 檢查標的是否存在
        const [existing] = await sequelize.query(
            'SELECT id FROM investment_opportunities WHERE id = ?',
            { replacements: [id] }
        );

        if ((existing as any[]).length === 0) {
            return res.status(404).json({ error: '找不到投資標的' });
        }

        // 建立更新欄位
        const updateFields = [];
        const updateValues = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ error: '沒有提供更新資料' });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        const query = `
            UPDATE investment_opportunities 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        await sequelize.query(query, { replacements: updateValues });

        // 回傳更新後的標的
        const [updatedOpportunity] = await sequelize.query(
            'SELECT * FROM investment_opportunities WHERE id = ?',
            { replacements: [id] }
        );

        res.json((updatedOpportunity as any[])[0]);
    } catch (error) {
        console.error('更新投資標的失敗:', error);
        res.status(500).json({ error: '更新投資標的失敗' });
    }
});

// 刪除投資標的 (需要認證)
router.delete('/investment-opportunities/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 檢查標的是否存在
        const [existing] = await sequelize.query(
            'SELECT id FROM investment_opportunities WHERE id = ?',
            { replacements: [id] }
        );

        if ((existing as any[]).length === 0) {
            return res.status(404).json({ error: '找不到投資標的' });
        }

        await sequelize.query('DELETE FROM investment_opportunities WHERE id = ?', { replacements: [id] });

        res.json({ message: '投資標的已刪除' });
    } catch (error) {
        console.error('刪除投資標的失敗:', error);
        res.status(500).json({ error: '刪除投資標的失敗' });
    }
});

// 更新投資標的狀態 (需要認證)
router.patch('/investment-opportunities/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['preview', 'active', 'hidden', 'closed'].includes(status)) {
            return res.status(400).json({ error: '無效的狀態值' });
        }

        const query = `
            UPDATE investment_opportunities 
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await sequelize.query(query, { replacements: [status, id] });

        // 回傳更新後的標的
        const [updatedOpportunity] = await sequelize.query(
            'SELECT * FROM investment_opportunities WHERE id = ?',
            { replacements: [id] }
        );

        res.json((updatedOpportunity as any[])[0]);
    } catch (error) {
        console.error('更新投資標的狀態失敗:', error);
        res.status(500).json({ error: '更新投資標的狀態失敗' });
    }
});

// 批量更新狀態 (需要認證)
router.patch('/investment-opportunities/batch-status', authMiddleware, async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: '請提供有效的 ID 列表' });
        }

        if (!['preview', 'active', 'hidden', 'closed'].includes(status)) {
            return res.status(400).json({ error: '無效的狀態值' });
        }

        const placeholders = ids.map(() => '?').join(',');
        const query = `
            UPDATE investment_opportunities 
            SET status = ?, updated_at = NOW()
            WHERE id IN (${placeholders})
        `;

        await sequelize.query(query, { replacements: [status, ...ids] });

        res.json({ message: '批量更新狀態成功' });
    } catch (error) {
        console.error('批量更新狀態失敗:', error);
        res.status(500).json({ error: '批量更新狀態失敗' });
    }
});

// 增加瀏覽次數
router.post('/investment-opportunities/:id/view', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE investment_opportunities 
            SET view_count = view_count + 1
            WHERE id = ?
        `;

        await sequelize.query(query, { replacements: [id] });

        res.json({ message: '瀏覽次數已更新' });
    } catch (error) {
        console.error('更新瀏覽次數失敗:', error);
        res.status(500).json({ error: '更新瀏覽次數失敗' });
    }
});

export default router; 