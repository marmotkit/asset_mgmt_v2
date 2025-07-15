import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Pool } from 'pg';

const router = Router();

// 建立 pg 原生連線池
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://asset_mgmt_user:你的密碼@dpg-d0cn12qdbo4c73fkljf0-a.singapore-postgres.render.com/asset_mgmt',
    ssl: { rejectUnauthorized: false }
});

// 獲取所有文件（發票/收據）
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('收到 /api/documents 請求:', req.query);
        const { memberId } = req.query;

        let sql = `
            SELECT id, type, member_id, member_name, payment_id, 
                   invoice_number, receipt_number, amount, date, 
                   created_at, updated_at
            FROM public.documents
        `;

        const params: any[] = [];
        if (memberId) {
            sql += ` WHERE member_id = $1`;
            params.push(memberId);
        }

        sql += ` ORDER BY created_at DESC`;

        console.log('執行 SQL:', sql);
        const client = await pgPool.connect();

        try {
            const result = await client.query(sql, params);
            const documents = result.rows;
            console.log('pg 查詢結果:', documents);

            const formattedDocuments = documents.map((doc) => ({
                id: doc.id,
                type: doc.type,
                memberId: doc.member_id,
                memberName: doc.member_name,
                paymentId: doc.payment_id,
                invoiceNumber: doc.invoice_number,
                receiptNumber: doc.receipt_number,
                amount: parseFloat(doc.amount),
                date: doc.date,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at
            }));

            console.log('API 回傳資料:', formattedDocuments);
            res.json(formattedDocuments);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('獲取文件失敗:', error);
        res.status(500).json({ error: '獲取文件失敗' });
    }
});

// 獲取單一文件
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT id, type, member_id, member_name, payment_id, 
                   invoice_number, receipt_number, amount, date, 
                   created_at, updated_at
            FROM public.documents
            WHERE id = $1
        `;

        const client = await pgPool.connect();
        try {
            const result = await client.query(sql, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: '文件不存在' });
            }

            const doc = result.rows[0];
            const formattedDoc = {
                id: doc.id,
                type: doc.type,
                memberId: doc.member_id,
                memberName: doc.member_name,
                paymentId: doc.payment_id,
                invoiceNumber: doc.invoice_number,
                receiptNumber: doc.receipt_number,
                amount: parseFloat(doc.amount),
                date: doc.date,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at
            };

            res.json(formattedDoc);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('獲取文件失敗:', error);
        res.status(500).json({ error: '獲取文件失敗' });
    }
});

// 創建文件（發票/收據）
router.post('/', authMiddleware, async (req, res) => {
    try {
        const documentData = req.body;
        console.log('收到創建文件請求:', documentData);

        const sql = `
            INSERT INTO documents (
                id, type, member_id, member_name, payment_id, 
                invoice_number, receipt_number, amount, date, 
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), $1::VARCHAR, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, 
                $5::VARCHAR, $6::VARCHAR, $7::DECIMAL, $8::DATE, NOW(), NOW()
            ) RETURNING *
        `;

        const client = await pgPool.connect();
        try {
            const result = await client.query(sql, [
                documentData.type,
                documentData.memberId,
                documentData.memberName,
                documentData.paymentId,
                documentData.invoiceNumber || null,
                documentData.receiptNumber || null,
                documentData.amount,
                documentData.date
            ]);

            const createdDoc = result.rows[0];
            const formattedDoc = {
                id: createdDoc.id,
                type: createdDoc.type,
                memberId: createdDoc.member_id,
                memberName: createdDoc.member_name,
                paymentId: createdDoc.payment_id,
                invoiceNumber: createdDoc.invoice_number,
                receiptNumber: createdDoc.receipt_number,
                amount: parseFloat(createdDoc.amount),
                date: createdDoc.date,
                createdAt: createdDoc.created_at,
                updatedAt: createdDoc.updated_at
            };

            console.log('文件建立成功:', formattedDoc);
            res.status(201).json(formattedDoc);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('創建文件失敗:', error);
        res.status(500).json({ error: '創建文件失敗', detail: error.message });
    }
});

// 更新文件
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const fields = [];
        const values = [];
        let idx = 1;

        const allowedFields = [
            'type', 'member_id', 'member_name', 'payment_id',
            'invoice_number', 'receipt_number', 'amount', 'date'
        ];

        for (const key in updateData) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${idx++}`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: '沒有可更新的欄位' });
        }

        fields.push(`updated_at = NOW()`);
        const sql = `UPDATE documents SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        values.push(id);

        const client = await pgPool.connect();
        try {
            const result = await client.query(sql, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: '文件不存在' });
            }

            const updatedDoc = result.rows[0];
            const formattedDoc = {
                id: updatedDoc.id,
                type: updatedDoc.type,
                memberId: updatedDoc.member_id,
                memberName: updatedDoc.member_name,
                paymentId: updatedDoc.payment_id,
                invoiceNumber: updatedDoc.invoice_number,
                receiptNumber: updatedDoc.receipt_number,
                amount: parseFloat(updatedDoc.amount),
                date: updatedDoc.date,
                createdAt: updatedDoc.created_at,
                updatedAt: updatedDoc.updated_at
            };

            res.json(formattedDoc);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('更新文件失敗:', error);
        res.status(500).json({ error: '更新文件失敗', detail: error.message });
    }
});

// 刪除文件
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM documents WHERE id = $1 RETURNING id`;

        const client = await pgPool.connect();
        try {
            const result = await client.query(sql, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: '文件不存在' });
            }

            res.json({ message: '文件刪除成功' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('刪除文件失敗:', error);
        res.status(500).json({ error: '刪除文件失敗', detail: error.message });
    }
});

export default router; 