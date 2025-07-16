"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';
// 建立 PostgreSQL 連線池
const pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
    } : false
});
// 獲取所有異常記錄
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('【異常記錄】查詢異常記錄失敗:', error);
        res.status(500).json({
            error: '查詢異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 新增異常記錄
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】新增異常記錄...', req.body);
        const { type, personId, personName, description, occurrenceDate, status = '待處理', handlingMethod } = req.body;
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
    }
    catch (error) {
        console.error('【異常記錄】新增異常記錄失敗:', error);
        res.status(500).json({
            error: '新增異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 更新異常記錄
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    var _a;
    try {
        console.log('【異常記錄】更新異常記錄...', req.params.id, req.body);
        const { id } = req.params;
        const { type, personId, personName, description, occurrenceDate, status, handlingMethod, changeReason } = req.body;
        // 驗證必填欄位
        if (!type || !personName || !description || !occurrenceDate) {
            return res.status(400).json({
                error: '缺少必填欄位',
                required: ['type', 'personName', 'description', 'occurrenceDate']
            });
        }
        // 先獲取原始資料
        const originalQuery = `
            SELECT type, person_id, person_name, description, occurrence_date, status, handling_method
            FROM anomalies WHERE id = $1
        `;
        const originalResult = await pool.query(originalQuery, [id]);
        if (originalResult.rows.length === 0) {
            return res.status(404).json({
                error: '異常記錄不存在'
            });
        }
        const original = originalResult.rows[0];
        // 更新異常記錄
        const updateQuery = `
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
        const result = await pool.query(updateQuery, values);
        const updatedAnomaly = result.rows[0];
        // 記錄修改歷史
        const changedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'system';
        const changes = [];
        if (original.type !== type) {
            changes.push(['type', original.type, type]);
        }
        if (original.person_id !== personId) {
            changes.push(['person_id', original.person_id, personId]);
        }
        if (original.person_name !== personName) {
            changes.push(['person_name', original.person_name, personName]);
        }
        if (original.description !== description) {
            changes.push(['description', original.description, description]);
        }
        if (original.occurrence_date !== occurrenceDate) {
            changes.push(['occurrence_date', original.occurrence_date, occurrenceDate]);
        }
        if (original.status !== status) {
            changes.push(['status', original.status, status]);
        }
        if (original.handling_method !== handlingMethod) {
            changes.push(['handling_method', original.handling_method, handlingMethod]);
        }
        // 插入修改記錄
        if (changes.length > 0) {
            const changeQuery = `
                INSERT INTO anomaly_changes (
                    anomaly_id, changed_by, field_name, old_value, new_value, change_reason
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `;
            for (const [fieldName, oldValue, newValue] of changes) {
                await pool.query(changeQuery, [
                    id, changedBy, fieldName, oldValue, newValue, changeReason || '系統更新'
                ]);
            }
        }
        console.log('【異常記錄】更新異常記錄成功:', updatedAnomaly.id);
        res.json(updatedAnomaly);
    }
    catch (error) {
        console.error('【異常記錄】更新異常記錄失敗:', error);
        res.status(500).json({
            error: '更新異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 刪除異常記錄
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('【異常記錄】刪除異常記錄失敗:', error);
        res.status(500).json({
            error: '刪除異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 獲取單一異常記錄
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('【異常記錄】查詢單一異常記錄失敗:', error);
        res.status(500).json({
            error: '查詢單一異常記錄失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
// 獲取異常記錄的修改歷史
router.get('/:id/changes', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        console.log('【異常記錄】查詢修改歷史...', req.params.id);
        const { id } = req.params;
        const query = `
            SELECT 
                id, changed_by as "changedBy", changed_at as "changedAt",
                field_name as "fieldName", old_value as "oldValue", 
                new_value as "newValue", change_reason as "changeReason"
            FROM anomaly_changes
            WHERE anomaly_id = $1
            ORDER BY changed_at DESC
        `;
        const result = await pool.query(query, [id]);
        console.log(`【異常記錄】找到 ${result.rows.length} 筆修改記錄`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('【異常記錄】查詢修改歷史失敗:', error);
        res.status(500).json({
            error: '查詢修改歷史失敗',
            details: error instanceof Error ? error.message : '未知錯誤'
        });
    }
});
exports.default = router;
