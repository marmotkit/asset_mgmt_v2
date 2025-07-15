import express from 'express';
import { Pool } from 'pg';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

// 建立 PostgreSQL 連線池
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
    } : false
});

// 獲取所有異常記錄
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】查詢所有異常記錄...');

        const query = `
            SELECT 
                id,
                type,
                person_id as "personId",
                person_name as "personName",
                description,
                occurrence_date as "occurrenceDate",
                status,
                handling_method as "handlingMethod",
                created_at as "createdAt",
                updated_at as "updatedAt"
            FROM anomalies
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);
        console.log(`【異常記錄】找到 ${result.rows.length} 筆異常記錄`);

        res.json(result.rows);
    } catch (error) {
        console.error('【異常記錄】查詢異常記錄失敗:', error);
        res.status(500).json({
            error: '查詢異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});

// 新增異常記錄
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】新增異常記錄...', req.body);

        const {
            type,
            personId,
            personName,
            description,
            occurrenceDate,
            status = '待處理',
            handlingMethod
        } = req.body;

        // 驗證必填欄位
        if (!type || !personName || !description || !occurrenceDate) {
            return res.status(400).json({
                error: '缺少必填欄位',
                required: ['type', 'personName', 'description', 'occurrenceDate']
            });
        }

        const query = `
            INSERT INTO anomalies (
                type, person_id, person_name, description, 
                occurrence_date, status, handling_method
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING 
                id, type, person_id as "personId", person_name as "personName",
                description, occurrence_date as "occurrenceDate", status,
                handling_method as "handlingMethod", created_at as "createdAt",
                updated_at as "updatedAt"
        `;

        const values = [type, personId, personName, description, occurrenceDate, status, handlingMethod];

        const result = await pool.query(query, values);
        const newAnomaly = result.rows[0];

        console.log('【異常記錄】新增異常記錄成功:', newAnomaly.id);

        res.status(201).json(newAnomaly);
    } catch (error) {
        console.error('【異常記錄】新增異常記錄失敗:', error);
        res.status(500).json({
            error: '新增異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});

// 更新異常記錄
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】更新異常記錄...', req.params.id, req.body);

        const { id } = req.params;
        const {
            type,
            personId,
            personName,
            description,
            occurrenceDate,
            status,
            handlingMethod
        } = req.body;

        // 驗證必填欄位
        if (!type || !personName || !description || !occurrenceDate) {
            return res.status(400).json({
                error: '缺少必填欄位',
                required: ['type', 'personName', 'description', 'occurrenceDate']
            });
        }

        const query = `
            UPDATE anomalies SET
                type = $1,
                person_id = $2,
                person_name = $3,
                description = $4,
                occurrence_date = $5,
                status = $6,
                handling_method = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING 
                id, type, person_id as "personId", person_name as "personName",
                description, occurrence_date as "occurrenceDate", status,
                handling_method as "handlingMethod", created_at as "createdAt",
                updated_at as "updatedAt"
        `;

        const values = [type, personId, personName, description, occurrenceDate, status, handlingMethod, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: '異常記錄不存在'
            });
        }

        const updatedAnomaly = result.rows[0];
        console.log('【異常記錄】更新異常記錄成功:', updatedAnomaly.id);

        res.json(updatedAnomaly);
    } catch (error) {
        console.error('【異常記錄】更新異常記錄失敗:', error);
        res.status(500).json({
            error: '更新異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});

// 刪除異常記錄
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】刪除異常記錄...', req.params.id);

        const { id } = req.params;

        const query = 'DELETE FROM anomalies WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: '異常記錄不存在'
            });
        }

        console.log('【異常記錄】刪除異常記錄成功:', id);

        res.json({
            message: '異常記錄刪除成功',
            id: id
        });
    } catch (error) {
        console.error('【異常記錄】刪除異常記錄失敗:', error);
        res.status(500).json({
            error: '刪除異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});

// 獲取單一異常記錄
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】查詢單一異常記錄...', req.params.id);

        const { id } = req.params;

        const query = `
            SELECT 
                id, type, person_id as "personId", person_name as "personName",
                description, occurrence_date as "occurrenceDate", status,
                handling_method as "handlingMethod", created_at as "createdAt",
                updated_at as "updatedAt"
            FROM anomalies
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: '異常記錄不存在'
            });
        }

        const anomaly = result.rows[0];
        console.log('【異常記錄】查詢單一異常記錄成功:', anomaly.id);

        res.json(anomaly);
    } catch (error) {
        console.error('【異常記錄】查詢單一異常記錄失敗:', error);
        res.status(500).json({
            error: '查詢單一異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});

export default router; 