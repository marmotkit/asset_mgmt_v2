import { Router } from 'express';
import Fee from '../models/Fee'; // <--- 這裡只能這樣寫
import { authMiddleware } from '../middlewares/auth.middleware';
import sequelize from '../db/connection';
import { QueryTypes, Op } from 'sequelize';
import { Pool } from 'pg';

const router = Router();

// 建立 pg 原生連線池
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://asset_mgmt_user:你的密碼@dpg-d0cn12qdbo4c73fkljf0-a.singapore-postgres.render.com/asset_mgmt',
    ssl: { rejectUnauthorized: false }
});

// 獲取所有費用記錄
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('收到 /api/fees 請求:', req.query);
        const isHistoryPage = req.query.isHistoryPage === 'true';
        const sql = `
            SELECT id, member_id, member_no, member_name, member_type, amount, due_date, status, note, created_at, updated_at, payment_method, paid_date
            FROM public.fees
            ORDER BY created_at DESC
        `;
        console.log('執行 SQL:', sql);
        // 用 pg 原生 client 查詢
        const client = await pgPool.connect();
        try {
            const result = await client.query(sql);
            const feeList = result.rows;
            console.log('pg 查詢結果:', feeList);
            const formattedFees = feeList.map((f) => ({
                id: f.id,
                amount: parseFloat(f.amount),
                memberId: f.member_id,
                memberNo: f.member_no,
                memberName: f.member_name,
                memberType: f.member_type,
                dueDate: f.due_date,
                paidDate: f.paid_date,
                paymentMethod: f.payment_method,
                status: f.status,
                note: f.note,
                createdAt: f.created_at,
                updatedAt: f.updated_at
            }));
            console.log('API 回傳資料:', formattedFees);
            res.json(formattedFees);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('獲取費用記錄失敗:', error);
        res.status(500).json({ error: '獲取費用記錄失敗' });
    }
});

// 獲取單一費用記錄
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) {
            return res.status(404).json({ error: '費用記錄不存在' });
        }
        res.json(fee);
    } catch (error) {
        console.error('獲取費用記錄失敗:', error);
        res.status(500).json({ error: '獲取費用記錄失敗' });
    }
});

// 創建費用記錄
router.post('/', authMiddleware, async (req, res) => {
    try {
        const feeData = req.body;
        console.log('收到創建費用請求:', feeData);

        // 使用原生 SQL 建立費用記錄
        console.log('開始使用原生 SQL 建立費用記錄...');
        console.log('feeData 內容:', JSON.stringify(feeData, null, 2));

        // 檢查 feeData 是否為陣列
        const dataToInsert = Array.isArray(feeData) ? feeData[0] : feeData;
        console.log('要插入的資料:', JSON.stringify(dataToInsert, null, 2));

        const results = await sequelize.query(`
            INSERT INTO fees (
                id, member_id, member_no, member_name, member_type, 
                amount, due_date, status, note, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), $1::VARCHAR, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, 
                $5::DECIMAL, $6::DATE, $7::VARCHAR, $8::TEXT, NOW(), NOW()
            ) RETURNING *
        `, {
            bind: [
                dataToInsert.memberId,   // 會員編號
                dataToInsert.memberNo,
                dataToInsert.memberName,
                dataToInsert.memberType,
                dataToInsert.amount,
                dataToInsert.dueDate,
                dataToInsert.status,
                dataToInsert.note
            ],
            type: QueryTypes.INSERT
        });

        console.log('費用記錄建立成功:', results);

        // 格式化回傳資料
        const createdFee = results[0][0];
        const formattedFee = {
            ...createdFee,
            amount: parseFloat(createdFee.amount),
            memberId: createdFee.member_id, // 轉換為前端期望的格式
            memberNo: createdFee.member_no,
            memberName: createdFee.member_name,
            memberType: createdFee.member_type,
            dueDate: createdFee.due_date,
            createdAt: createdFee.created_at,
            updatedAt: createdFee.updated_at
        };

        res.status(201).json(formattedFee);
    } catch (error) {
        console.error('創建費用記錄失敗:', error);
        res.status(500).json({ error: '創建費用記錄失敗', detail: error.message, stack: error.stack });
    }
});

// 更新費用記錄
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // 動態組合可更新欄位，支援 camelCase 轉 snake_case，且每個欄位只出現一次
        const fields = [];
        const values = [];
        let idx = 1;
        const allowedFields = [
            'status', 'amount', 'due_date', 'note', 'paid_date', 'payment_method',
            'member_id', 'member_no', 'member_name', 'member_type'
        ];
        // camelCase 對應表
        const camelToSnake: Record<string, string> = {
            paymentMethod: 'payment_method',
            paidDate: 'paid_date',
            dueDate: 'due_date',
            memberId: 'member_id',
            memberNo: 'member_no',
            memberName: 'member_name',
            memberType: 'member_type',
        };
        const usedDbFields = new Set<string>();
        for (const key in updateData) {
            let dbField = key;
            if (camelToSnake[key]) dbField = camelToSnake[key];
            if (allowedFields.includes(dbField) && !usedDbFields.has(dbField)) {
                fields.push(`${dbField} = $${idx++}`);
                values.push(updateData[key]);
                usedDbFields.add(dbField);
            }
        }
        fields.push(`updated_at = NOW()`);
        if (fields.length === 1) {
            return res.status(400).json({ error: '沒有可更新的欄位' });
        }
        const sql = `UPDATE fees SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        values.push(id);
        const [result] = await sequelize.query(sql, {
            bind: values,
            type: QueryTypes.UPDATE
        });
        if (!result || !result[0]) {
            return res.status(404).json({ error: '費用記錄不存在' });
        }
        const updatedFee: any = result[0];
        const formattedFee = {
            ...updatedFee,
            amount: parseFloat(updatedFee.amount),
            memberId: updatedFee.member_id,
            memberNo: updatedFee.member_no,
            memberName: updatedFee.member_name,
            memberType: updatedFee.member_type,
            dueDate: updatedFee.due_date,
            paidDate: updatedFee.paid_date,
            paymentMethod: updatedFee.payment_method,
            createdAt: updatedFee.created_at,
            updatedAt: updatedFee.updated_at
        };
        res.json(formattedFee);
    } catch (error) {
        console.error('更新費用記錄失敗:', error);
        res.status(500).json({ error: '更新費用記錄失敗', detail: error.message, stack: error.stack });
    }
});

// 刪除費用記錄
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) {
            return res.status(404).json({ error: '費用記錄不存在' });
        }

        await fee.destroy();
        res.json({ message: '費用記錄已刪除' });
    } catch (error) {
        console.error('刪除費用記錄失敗:', error);
        res.status(500).json({ error: '刪除費用記錄失敗' });
    }
});

// 批量創建費用記錄
router.post('/batch', authMiddleware, async (req, res) => {
    try {
        const feesData = req.body;
        const fees = await Fee.bulkCreate(feesData);
        res.status(201).json(fees);
    } catch (error) {
        console.error('批量創建費用記錄失敗:', error);
        res.status(500).json({ error: '批量創建費用記錄失敗' });
    }
});

export default router; 