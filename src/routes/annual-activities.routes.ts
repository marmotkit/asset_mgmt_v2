import express from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// 獲取所有年度活動
router.get('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { year, status } = req.query;

        let query = `
            SELECT 
                id, title, description, start_date, end_date, location, 
                capacity, registration_deadline, status, year, cover_image,
                created_at, updated_at
            FROM annual_activities
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (year) {
            query += ` AND year = $${paramIndex}`;
            params.push(parseInt(year as string));
            paramIndex++;
        }

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY year DESC, start_date DESC`;

        const result = await client.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('獲取年度活動失敗:', error);
        res.status(500).json({ error: '獲取年度活動失敗' });
    } finally {
        client.release();
    }
});

// 獲取單個年度活動
router.get('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `
            SELECT 
                id, title, description, start_date, end_date, location, 
                capacity, registration_deadline, status, year, cover_image,
                created_at, updated_at
            FROM annual_activities
            WHERE id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的活動' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('獲取活動詳情失敗:', error);
        res.status(500).json({ error: '獲取活動詳情失敗' });
    } finally {
        client.release();
    }
});

// 建立年度活動
router.post('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            title, description, startDate, endDate, location, capacity,
            registrationDeadline, status, year, coverImage
        } = req.body;

        const query = `
            INSERT INTO annual_activities (
                title, description, start_date, end_date, location, 
                capacity, registration_deadline, status, year, cover_image
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            title, description, startDate, endDate, location,
            capacity, registrationDeadline, status, year, coverImage
        ];

        const result = await client.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('建立活動失敗:', error);
        res.status(500).json({ error: '建立活動失敗' });
    } finally {
        client.release();
    }
});

// 更新年度活動
router.put('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const {
            title, description, startDate, endDate, location, capacity,
            registrationDeadline, status, year, coverImage
        } = req.body;

        const query = `
            UPDATE annual_activities SET
                title = $1, description = $2, start_date = $3, end_date = $4,
                location = $5, capacity = $6, registration_deadline = $7,
                status = $8, year = $9, cover_image = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *
        `;

        const values = [
            title, description, startDate, endDate, location,
            capacity, registrationDeadline, status, year, coverImage, id
        ];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的活動' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('更新活動失敗:', error);
        res.status(500).json({ error: '更新活動失敗' });
    } finally {
        client.release();
    }
});

// 刪除年度活動
router.delete('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        const query = `DELETE FROM annual_activities WHERE id = $1 RETURNING id`;
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的活動' });
        }

        res.json({ message: '活動刪除成功' });
    } catch (error) {
        console.error('刪除活動失敗:', error);
        res.status(500).json({ error: '刪除活動失敗' });
    } finally {
        client.release();
    }
});

export default router; 