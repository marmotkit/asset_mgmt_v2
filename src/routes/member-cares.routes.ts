import express from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// 獲取會員關懷記錄
router.get('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { memberId, type, status } = req.query;

        let query = `
            SELECT 
                mc.id, mc.member_id, mc.type, mc.title, mc.description,
                mc.care_date, mc.status, mc.assigned_to, mc.follow_up_date,
                mc.notes, mc.created_at, mc.updated_at,
                u.name as member_name, u.email as member_email,
                a.name as assigned_to_name
            FROM member_cares mc
            LEFT JOIN users u ON mc.member_id = u.id
            LEFT JOIN users a ON mc.assigned_to = a.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (memberId) {
            query += ` AND mc.member_id = $${paramIndex}`;
            params.push(memberId);
            paramIndex++;
        }

        if (type) {
            query += ` AND mc.type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (status) {
            query += ` AND mc.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY mc.care_date DESC`;

        const result = await client.query(query, params);

        // 轉換欄位名稱從 snake_case 到 camelCase
        const transformedRows = result.rows.map(row => ({
            id: row.id,
            memberId: row.member_id,
            type: row.type,
            title: row.title,
            description: row.description,
            date: row.care_date,
            status: row.status,
            assignedTo: row.assigned_to,
            followUpDate: row.follow_up_date,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            memberName: row.member_name,
            memberEmail: row.member_email,
            assignedToName: row.assigned_to_name
        }));

        console.log('查詢到的關懷記錄:', transformedRows);

        res.json(transformedRows);
    } catch (error) {
        console.error('獲取會員關懷記錄失敗:', error);
        res.status(500).json({ error: '獲取會員關懷記錄失敗' });
    } finally {
        client.release();
    }
});

// 獲取單個會員關懷記錄
router.get('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `
            SELECT 
                mc.id, mc.member_id, mc.type, mc.title, mc.description,
                mc.care_date, mc.status, mc.assigned_to, mc.follow_up_date,
                mc.notes, mc.created_at, mc.updated_at,
                u.name as member_name, u.email as member_email,
                a.name as assigned_to_name
            FROM member_cares mc
            LEFT JOIN users u ON mc.member_id = u.id
            LEFT JOIN users a ON mc.assigned_to = a.id
            WHERE mc.id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的會員關懷記錄' });
        }

        // 轉換欄位名稱從 snake_case 到 camelCase
        const transformedRow = {
            id: result.rows[0].id,
            memberId: result.rows[0].member_id,
            type: result.rows[0].type,
            title: result.rows[0].title,
            description: result.rows[0].description,
            date: result.rows[0].care_date,
            status: result.rows[0].status,
            assignedTo: result.rows[0].assigned_to,
            followUpDate: result.rows[0].follow_up_date,
            notes: result.rows[0].notes,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
            memberName: result.rows[0].member_name,
            memberEmail: result.rows[0].member_email,
            assignedToName: result.rows[0].assigned_to_name
        };

        res.json(transformedRow);
    } catch (error) {
        console.error('獲取會員關懷記錄詳情失敗:', error);
        res.status(500).json({ error: '獲取會員關懷記錄詳情失敗' });
    } finally {
        client.release();
    }
});

// 建立會員關懷記錄
router.post('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            memberId, type, title, description, date, status, assignedTo, followUpDate, notes
        } = req.body;

        console.log('收到的關懷記錄資料:', req.body);

        // 檢查會員是否存在
        const memberQuery = `SELECT * FROM users WHERE id = $1`;
        const memberResult = await client.query(memberQuery, [memberId]);

        if (memberResult.rows.length === 0) {
            return res.status(404).json({ error: '會員不存在' });
        }

        // 如果指定了負責人，檢查負責人是否存在
        if (assignedTo) {
            const assignedQuery = `SELECT * FROM users WHERE id = $1`;
            const assignedResult = await client.query(assignedQuery, [assignedTo]);

            if (assignedResult.rows.length === 0) {
                return res.status(404).json({ error: '指定的負責人不存在' });
            }
        }

        // 修正：將 date 轉為 YYYY-MM-DD 格式
        const careDate = date ? date.split('T')[0] : null;

        const query = `
            INSERT INTO member_cares (
                member_id, type, title, description, care_date, status, 
                assigned_to, follow_up_date, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            memberId, type, title, description || '', careDate, status || 'planned',
            assignedTo, followUpDate, notes
        ];

        console.log('插入的關懷記錄資料:', values);

        const result = await client.query(query, values);

        console.log('插入結果:', result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('建立會員關懷記錄失敗:', error);
        res.status(500).json({ error: '建立會員關懷記錄失敗' });
    } finally {
        client.release();
    }
});

// 更新會員關懷記錄
router.put('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const {
            type, title, description, date, status, assignedTo, followUpDate, notes
        } = req.body;

        // 如果指定了負責人，檢查負責人是否存在
        if (assignedTo) {
            const assignedQuery = `SELECT * FROM users WHERE id = $1`;
            const assignedResult = await client.query(assignedQuery, [assignedTo]);

            if (assignedResult.rows.length === 0) {
                return res.status(404).json({ error: '指定的負責人不存在' });
            }
        }

        const query = `
            UPDATE member_cares SET
                type = $1, title = $2, description = $3, care_date = $4,
                status = $5, assigned_to = $6, follow_up_date = $7, notes = $8,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *
        `;

        const values = [
            type, title, description || '', date, status, assignedTo,
            followUpDate, notes, id
        ];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的會員關懷記錄' });
        }

        // 轉換欄位名稱從 snake_case 到 camelCase
        const transformedRow = {
            id: result.rows[0].id,
            memberId: result.rows[0].member_id,
            type: result.rows[0].type,
            title: result.rows[0].title,
            description: result.rows[0].description,
            date: result.rows[0].care_date,
            status: result.rows[0].status,
            assignedTo: result.rows[0].assigned_to,
            followUpDate: result.rows[0].follow_up_date,
            notes: result.rows[0].notes,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        };

        res.json(transformedRow);
    } catch (error) {
        console.error('更新會員關懷記錄失敗:', error);
        res.status(500).json({ error: '更新會員關懷記錄失敗' });
    } finally {
        client.release();
    }
});

// 刪除會員關懷記錄
router.delete('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `DELETE FROM member_cares WHERE id = $1 RETURNING id`;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的會員關懷記錄' });
        }

        res.json({ message: '會員關懷記錄刪除成功' });
    } catch (error) {
        console.error('刪除會員關懷記錄失敗:', error);
        res.status(500).json({ error: '刪除會員關懷記錄失敗' });
    } finally {
        client.release();
    }
});

export default router; 