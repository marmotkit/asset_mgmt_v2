import express from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// 獲取活動報名記錄
router.get('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { activityId, memberId } = req.query;

        let query = `
            SELECT 
                ar.id, ar.activity_id, ar.member_id, ar.registration_date,
                ar.status, ar.notes, ar.companions, ar.special_requests,
                ar.created_at, ar.updated_at,
                u.name as member_name, u.email as member_email,
                aa.title as activity_title
            FROM activity_registrations ar
            LEFT JOIN users u ON ar.member_id = u.id
            LEFT JOIN annual_activities aa ON ar.activity_id = aa.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (activityId) {
            query += ` AND ar.activity_id = $${paramIndex}`;
            params.push(activityId);
            paramIndex++;
        }

        if (memberId) {
            query += ` AND ar.member_id = $${paramIndex}`;
            params.push(memberId);
            paramIndex++;
        }

        query += ` ORDER BY ar.registration_date DESC`;

        const result = await client.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('獲取活動報名記錄失敗:', error);
        res.status(500).json({ error: '獲取活動報名記錄失敗' });
    } finally {
        client.release();
    }
});

// 獲取單個報名記錄
router.get('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `
            SELECT 
                ar.id, ar.activity_id, ar.member_id, ar.registration_date,
                ar.status, ar.notes, ar.companions, ar.special_requests,
                ar.created_at, ar.updated_at,
                u.name as member_name, u.email as member_email,
                aa.title as activity_title
            FROM activity_registrations ar
            LEFT JOIN users u ON ar.member_id = u.id
            LEFT JOIN annual_activities aa ON ar.activity_id = aa.id
            WHERE ar.id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的報名記錄' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('獲取報名記錄詳情失敗:', error);
        res.status(500).json({ error: '獲取報名記錄詳情失敗' });
    } finally {
        client.release();
    }
});

// 建立活動報名
router.post('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            activityId, memberId, status, notes, companions, specialRequests
        } = req.body;

        // 檢查活動是否存在
        const activityQuery = `SELECT * FROM annual_activities WHERE id = $1`;
        const activityResult = await client.query(activityQuery, [activityId]);

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ error: '活動不存在' });
        }

        // 檢查是否已經報名
        const existingQuery = `
            SELECT * FROM activity_registrations 
            WHERE activity_id = $1 AND member_id = $2
        `;
        const existingResult = await client.query(existingQuery, [activityId, memberId]);

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: '已經報名過此活動' });
        }

        // 檢查活動是否已滿員
        const capacityQuery = `
            SELECT 
                aa.capacity,
                COUNT(ar.id) as current_registrations,
                COALESCE(SUM(ar.companions), 0) as total_companions
            FROM annual_activities aa
            LEFT JOIN activity_registrations ar ON aa.id = ar.activity_id
            WHERE aa.id = $1
            GROUP BY aa.capacity
        `;
        const capacityResult = await client.query(capacityQuery, [activityId]);

        if (capacityResult.rows.length > 0) {
            const { capacity, current_registrations, total_companions } = capacityResult.rows[0];
            const totalParticipants = parseInt(current_registrations) + parseInt(total_companions) + (companions || 0);

            if (totalParticipants >= capacity) {
                return res.status(400).json({ error: '活動已達報名上限' });
            }
        }

        const query = `
            INSERT INTO activity_registrations (
                activity_id, member_id, status, notes, companions, special_requests
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [activityId, memberId, status || 'pending', notes || '', companions || 0, specialRequests];

        const result = await client.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('建立活動報名失敗:', error);
        res.status(500).json({ error: '建立活動報名失敗' });
    } finally {
        client.release();
    }
});

// 更新活動報名
router.put('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { status, notes, companions, specialRequests } = req.body;

        const query = `
            UPDATE activity_registrations SET
                status = $1, notes = $2, companions = $3, 
                special_requests = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;

        const values = [status, notes || '', companions || 0, specialRequests, id];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的報名記錄' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('更新活動報名失敗:', error);
        res.status(500).json({ error: '更新活動報名失敗' });
    } finally {
        client.release();
    }
});

// 刪除活動報名
router.delete('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `DELETE FROM activity_registrations WHERE id = $1 RETURNING id`;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的報名記錄' });
        }

        res.json({ message: '報名記錄刪除成功' });
    } catch (error) {
        console.error('刪除活動報名失敗:', error);
        res.status(500).json({ error: '刪除活動報名失敗' });
    } finally {
        client.release();
    }
});

export default router; 