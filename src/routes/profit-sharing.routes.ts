import express from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../db/connection';

const router = express.Router();

// 獲取所有分潤標準
router.get('/', async (req, res) => {
    try {
        const { investmentId } = req.query;

        let query = `
            SELECT 
                pss.*,
                i.name as investment_name,
                i.type as investment_type
            FROM profit_sharing_standards pss
            LEFT JOIN investments i ON pss."investmentId" = i.id
            ORDER BY pss."createdAt" DESC
        `;

        let replacements: any = {};

        if (investmentId) {
            query = query.replace('ORDER BY', 'WHERE pss."investmentId" = :investmentId ORDER BY');
            replacements.investmentId = investmentId;
        }

        const profitSharingStandards = await sequelize.query(query, {
            replacements,
            type: QueryTypes.SELECT
        });

        res.json(profitSharingStandards);
    } catch (error) {
        console.error('獲取分潤標準失敗:', error);
        res.status(500).json({ error: '獲取分潤標準失敗' });
    }
});

// 獲取單個分潤標準
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                pss.*,
                i.name as investment_name,
                i.type as investment_type
            FROM profit_sharing_standards pss
            LEFT JOIN investments i ON pss."investmentId" = i.id
            WHERE pss.id = :id
        `;

        const profitSharingStandards = await sequelize.query(query, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (profitSharingStandards.length === 0) {
            return res.status(404).json({ error: '分潤標準不存在' });
        }

        res.json(profitSharingStandards[0]);
    } catch (error) {
        console.error('獲取分潤標準失敗:', error);
        res.status(500).json({ error: '獲取分潤標準失敗' });
    }
});

// 創建分潤標準
router.post('/', async (req, res) => {
    try {
        const {
            investmentId,
            type,
            value,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            note
        } = req.body;

        const query = `
            INSERT INTO profit_sharing_standards (
                id, "investmentId", type, value, "minAmount", "maxAmount", 
                "startDate", "endDate", note, "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), :investmentId, :type, :value, :minAmount, :maxAmount,
                :startDate, :endDate, :note, NOW(), NOW()
            ) RETURNING *
        `;

        const result = await sequelize.query(query, {
            replacements: {
                investmentId,
                type,
                value,
                minAmount,
                maxAmount,
                startDate,
                endDate,
                note
            },
            type: QueryTypes.INSERT
        });

        // 直接返回插入的結果
        const insertedProfitSharingStandard = result[0] as any;

        if (insertedProfitSharingStandard && insertedProfitSharingStandard.id) {
            const newProfitSharingStandard = await sequelize.query(`
                SELECT 
                    pss.*,
                    i.name as investment_name,
                    i.type as investment_type
                FROM profit_sharing_standards pss
                LEFT JOIN investments i ON pss."investmentId" = i.id
                WHERE pss.id = :id
            `, {
                replacements: { id: insertedProfitSharingStandard.id },
                type: QueryTypes.SELECT
            });

            res.status(201).json(newProfitSharingStandard[0]);
        } else {
            // 如果沒有返回 ID，直接返回插入的資料
            res.status(201).json(insertedProfitSharingStandard);
        }
    } catch (error) {
        console.error('創建分潤標準失敗:', error);
        res.status(400).json({ error: '創建分潤標準失敗' });
    }
});

// 更新分潤標準
router.put('/:id', async (req, res) => {
    try {
        // 檢查分潤標準是否存在
        const checkQuery = 'SELECT id FROM profit_sharing_standards WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '分潤標準不存在' });
        }

        const {
            investmentId,
            type,
            value,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            note
        } = req.body;

        const updateQuery = `
            UPDATE profit_sharing_standards SET
                "investmentId" = :investmentId,
                type = :type,
                value = :value,
                "minAmount" = :minAmount,
                "maxAmount" = :maxAmount,
                "startDate" = :startDate,
                "endDate" = :endDate,
                note = :note,
                "updatedAt" = NOW()
            WHERE id = :id
        `;

        await sequelize.query(updateQuery, {
            replacements: {
                id: req.params.id,
                investmentId,
                type,
                value,
                minAmount,
                maxAmount,
                startDate,
                endDate,
                note
            },
            type: QueryTypes.UPDATE
        });

        // 獲取更新後的分潤標準
        const updatedProfitSharingStandard = await sequelize.query(`
            SELECT 
                pss.*,
                i.name as investment_name,
                i.type as investment_type
            FROM profit_sharing_standards pss
            LEFT JOIN investments i ON pss."investmentId" = i.id
            WHERE pss.id = :id
        `, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        res.json(updatedProfitSharingStandard[0]);
    } catch (error) {
        console.error('更新分潤標準失敗:', error);
        res.status(400).json({ error: '更新分潤標準失敗' });
    }
});

// 刪除分潤標準
router.delete('/:id', async (req, res) => {
    try {
        // 檢查分潤標準是否存在
        const checkQuery = 'SELECT id FROM profit_sharing_standards WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '分潤標準不存在' });
        }

        // 刪除分潤標準
        const deleteQuery = 'DELETE FROM profit_sharing_standards WHERE id = :id';
        await sequelize.query(deleteQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });

        res.status(204).send();
    } catch (error) {
        console.error('刪除分潤標準失敗:', error);
        res.status(500).json({ error: '刪除分潤標準失敗' });
    }
});

export default router; 