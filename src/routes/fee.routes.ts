import { Router } from 'express';
import Fee from '../models/Fee'; // <--- 這裡只能這樣寫
import { authMiddleware } from '../middlewares/auth.middleware';
import sequelize from '../db/connection';
import { QueryTypes } from 'sequelize';

const router = Router();

// 獲取所有費用記錄
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { isHistoryPage, type } = req.query;

        let whereClause: any = {};

        // 如果是歷史記錄頁面，顯示所有記錄
        if (isHistoryPage === 'true') {
            // 顯示所有記錄
        } else {
            // 只顯示未付款的記錄
            whereClause.status = 'pending';
        }

        // 如果是設定類型，返回費用設定
        if (type === 'setting') {
            // 返回費用設定資料
            const feeSettings = [
                {
                    id: '1',
                    memberType: '一般會員',
                    amount: 30000,
                    period: '年',
                    description: '一般會員年費'
                },
                {
                    id: '2',
                    memberType: '永久會員',
                    amount: 300000,
                    period: '5年',
                    description: '永久會員5年費用'
                },
                {
                    id: '3',
                    memberType: '商務會員',
                    amount: 3000000,
                    period: '5年',
                    description: '商務會員5年費用'
                },
                {
                    id: '4',
                    memberType: '管理員',
                    amount: 0,
                    period: '永久',
                    description: '管理員免費'
                }
            ];
            return res.json(feeSettings);
        }

        const fees = await Fee.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json(fees);
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
                gen_random_uuid(), gen_random_uuid(), $1::VARCHAR, $2::VARCHAR, $3::VARCHAR, 
                $4::DECIMAL, $5::DATE, $6::VARCHAR, $7::TEXT, NOW(), NOW()
            ) RETURNING *
        `, {
            bind: [
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
        res.status(201).json(results[0]);
    } catch (error) {
        console.error('創建費用記錄失敗:', error);
        res.status(500).json({ error: '創建費用記錄失敗', detail: error.message, stack: error.stack });
    }
});

// 更新費用記錄
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const fee = await Fee.findByPk(req.params.id);
        if (!fee) {
            return res.status(404).json({ error: '費用記錄不存在' });
        }

        await fee.update(req.body);
        res.json(fee);
    } catch (error) {
        console.error('更新費用記錄失敗:', error);
        res.status(500).json({ error: '更新費用記錄失敗' });
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