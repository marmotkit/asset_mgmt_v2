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

        res.json(result.rows);
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

        res.json(result.rows[0]);
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
            memberId, type, title, description, careDate, status, assignedTo, followUpDate, notes
        } = req.body;

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

        const result = await client.query(query, values);

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
            type, title, description, careDate, status, assignedTo, followUpDate, notes
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
            type, title, description || '', careDate, status, assignedTo,
            followUpDate, notes, id
        ];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的會員關懷記錄' });
        }

        res.json(result.rows[0]);
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