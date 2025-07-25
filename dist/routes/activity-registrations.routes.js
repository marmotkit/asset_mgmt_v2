"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
// 獲取活動報名記錄
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { activityId, memberId } = req.query;
        let query = `
            SELECT 
                ar.id, ar.activity_id, ar.member_id, ar.registration_date,
                ar.status, ar.notes, ar.member_name, ar.phone_number,
                ar.total_participants, ar.male_count, ar.female_count,
                ar.companions, ar.created_at, ar.updated_at,
                u.name as user_name, u.email as user_email,
                aa.title as activity_title, aa.start_date as activity_date,
                aa.location as activity_location
            FROM activity_registrations ar
            LEFT JOIN users u ON ar.member_id = u.id
            LEFT JOIN annual_activities aa ON ar.activity_id = aa.id
            WHERE 1=1
        `;
        const params = [];
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
    }
    catch (error) {
        console.error('獲取活動報名記錄失敗:', error);
        res.status(500).json({ error: '獲取活動報名記錄失敗' });
    }
    finally {
        client.release();
    }
});
// 獲取單個報名記錄
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                ar.id, ar.activity_id, ar.member_id, ar.registration_date,
                ar.status, ar.notes, ar.member_name, ar.phone_number,
                ar.total_participants, ar.male_count, ar.female_count,
                ar.companions, ar.created_at, ar.updated_at,
                u.name as user_name, u.email as user_email,
                aa.title as activity_title, aa.start_date as activity_date,
                aa.location as activity_location
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
    }
    catch (error) {
        console.error('獲取報名記錄詳情失敗:', error);
        res.status(500).json({ error: '獲取報名記錄詳情失敗' });
    }
    finally {
        client.release();
    }
});
// 建立活動報名
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { activityId, memberName, phoneNumber, totalParticipants, maleCount, femaleCount, notes, memberId } = req.body;
        // 檢查活動是否存在
        const activityQuery = `SELECT * FROM annual_activities WHERE id = $1`;
        const activityResult = await client.query(activityQuery, [activityId]);
        if (activityResult.rows.length === 0) {
            return res.status(404).json({ error: '活動不存在' });
        }
        const activity = activityResult.rows[0];
        // 檢查活動是否在報名期間
        const now = new Date();
        const registrationDeadline = new Date(activity.registration_deadline);
        if (now > registrationDeadline) {
            return res.status(400).json({ error: '報名已截止' });
        }
        // 檢查活動狀態是否允許報名
        console.log('活動狀態檢查:', {
            activityStatus: activity.status,
            expectedStatus: 'registration',
            isRegistrationOpen: activity.status === 'registration'
        });
        // 允許報名的狀態：registration 或 ongoing
        if (activity.status !== 'registration' && activity.status !== 'ongoing') {
            return res.status(400).json({
                error: `活動目前不接受報名 (狀態: ${activity.status})`
            });
        }
        // 檢查是否已經報名（如果提供了memberId）
        if (memberId) {
            const existingQuery = `
                SELECT * FROM activity_registrations 
                WHERE activity_id = $1 AND member_id = $2
            `;
            const existingResult = await client.query(existingQuery, [activityId, memberId]);
            if (existingResult.rows.length > 0) {
                return res.status(400).json({ error: '已經報名過此活動' });
            }
        }
        // 檢查活動是否已滿員
        const capacityQuery = `
            SELECT 
                aa.capacity,
                COALESCE(SUM(ar.total_participants), 0) as current_participants
            FROM annual_activities aa
            LEFT JOIN activity_registrations ar ON aa.id = ar.activity_id
            WHERE aa.id = $1
            GROUP BY aa.capacity
        `;
        const capacityResult = await client.query(capacityQuery, [activityId]);
        if (capacityResult.rows.length > 0) {
            const { capacity, current_participants } = capacityResult.rows[0];
            const totalCurrentParticipants = parseInt(current_participants) + (totalParticipants || 0);
            if (totalCurrentParticipants > capacity) {
                return res.status(400).json({ error: '活動已達報名上限' });
            }
        }
        const query = `
            INSERT INTO activity_registrations (
                activity_id, member_id, member_name, phone_number, 
                total_participants, male_count, female_count, 
                status, notes, registration_date, companions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10)
            RETURNING *
        `;
        // 計算隨行人數：總人數 - 1（報名者本人）
        const companions = Math.max(0, (totalParticipants || 1) - 1);
        const values = [
            activityId,
            memberId || null,
            memberName,
            phoneNumber,
            totalParticipants || 1,
            maleCount || 0,
            femaleCount || 0,
            'pending',
            notes || '',
            companions
        ];
        const result = await client.query(query, values);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('建立活動報名失敗:', error);
        res.status(500).json({ error: '建立活動報名失敗' });
    }
    finally {
        client.release();
    }
});
// 更新活動報名
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status, notes, memberName, phoneNumber, totalParticipants, maleCount, femaleCount, companions } = req.body;
        console.log('更新報名記錄:', { id, status, notes, companions }); // 除錯用
        // 構建動態更新查詢
        let updateFields = [];
        let values = [];
        let paramIndex = 1;
        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
            console.log('設定狀態為:', status); // 除錯用
        }
        if (notes !== undefined) {
            updateFields.push(`notes = $${paramIndex}`);
            values.push(notes);
            paramIndex++;
        }
        if (memberName !== undefined) {
            updateFields.push(`member_name = $${paramIndex}`);
            values.push(memberName);
            paramIndex++;
        }
        if (phoneNumber !== undefined) {
            updateFields.push(`phone_number = $${paramIndex}`);
            values.push(phoneNumber);
            paramIndex++;
        }
        if (totalParticipants !== undefined) {
            updateFields.push(`total_participants = $${paramIndex}`);
            values.push(totalParticipants);
            paramIndex++;
        }
        if (maleCount !== undefined) {
            updateFields.push(`male_count = $${paramIndex}`);
            values.push(maleCount);
            paramIndex++;
        }
        if (femaleCount !== undefined) {
            updateFields.push(`female_count = $${paramIndex}`);
            values.push(femaleCount);
            paramIndex++;
        }
        if (companions !== undefined) {
            updateFields.push(`companions = $${paramIndex}`);
            values.push(companions);
            paramIndex++;
        }
        // 添加更新時間
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        // 添加ID到values陣列
        values.push(id);
        const query = `
            UPDATE activity_registrations SET
                ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        console.log('執行SQL:', query); // 除錯用
        console.log('參數:', values); // 除錯用
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的報名記錄' });
        }
        console.log('更新結果:', result.rows[0]); // 除錯用
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('更新活動報名失敗:', error);
        res.status(500).json({ error: '更新活動報名失敗' });
    }
    finally {
        client.release();
    }
});
// 刪除活動報名
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const query = `DELETE FROM activity_registrations WHERE id = $1 RETURNING id`;
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到指定的報名記錄' });
        }
        res.json({ message: '報名記錄刪除成功' });
    }
    catch (error) {
        console.error('刪除活動報名失敗:', error);
        res.status(500).json({ error: '刪除活動報名失敗' });
    }
    finally {
        client.release();
    }
});
exports.default = router;
