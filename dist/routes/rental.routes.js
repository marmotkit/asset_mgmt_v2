"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const router = express_1.default.Router();
// 獲取所有租賃標準
router.get('/', async (req, res) => {
    try {
        const { investmentId } = req.query;
        let query = `
            SELECT 
                rs.*,
                i.name as investment_name,
                i.type as investment_type
            FROM rental_standards rs
            LEFT JOIN investments i ON rs."investmentId" = i.id
            ORDER BY rs."createdAt" DESC
        `;
        let replacements = {};
        if (investmentId) {
            query = query.replace('ORDER BY', 'WHERE rs."investmentId" = :investmentId ORDER BY');
            replacements.investmentId = investmentId;
        }
        const rentalStandards = await connection_1.default.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT
        });
        res.json(rentalStandards);
    }
    catch (error) {
        console.error('獲取租賃標準失敗:', error);
        res.status(500).json({ error: '獲取租賃標準失敗' });
    }
});
// 獲取有租賃標準的投資項目（用於租金收款項目生成）
router.get('/available-investments', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                i.id,
                i.name,
                i.type,
                i.amount,
                i."startDate",
                i.status,
                c.name as company_name,
                u.name as user_name
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            INNER JOIN rental_standards rs ON i.id = rs."investmentId"
            WHERE i.status = 'active'
            ORDER BY i.name
        `;
        const investments = await connection_1.default.query(query, {
            type: sequelize_1.QueryTypes.SELECT
        });
        res.json(investments);
    }
    catch (error) {
        console.error('獲取有租賃標準的投資項目失敗:', error);
        res.status(500).json({ error: '獲取有租賃標準的投資項目失敗' });
    }
});
// 獲取單個租賃標準
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT 
                rs.*,
                i.name as investment_name,
                i.type as investment_type
            FROM rental_standards rs
            LEFT JOIN investments i ON rs."investmentId" = i.id
            WHERE rs.id = :id
        `;
        const rentalStandards = await connection_1.default.query(query, {
            replacements: { id: req.params.id },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (rentalStandards.length === 0) {
            return res.status(404).json({ error: '租賃標準不存在' });
        }
        res.json(rentalStandards[0]);
    }
    catch (error) {
        console.error('獲取租賃標準失敗:', error);
        res.status(500).json({ error: '獲取租賃標準失敗' });
    }
});
// 創建租賃標準
router.post('/', async (req, res) => {
    try {
        const { investmentId, monthlyRent, startDate, endDate, renterName, renterTaxId, note } = req.body;
        const query = `
            INSERT INTO rental_standards (
                id, "investmentId", "monthlyRent", "startDate", "endDate", 
                "renterName", "renterTaxId", note, "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), :investmentId, :monthlyRent, :startDate, :endDate,
                :renterName, :renterTaxId, :note, NOW(), NOW()
            ) RETURNING *
        `;
        const result = await connection_1.default.query(query, {
            replacements: {
                investmentId,
                monthlyRent,
                startDate,
                endDate,
                renterName,
                renterTaxId,
                note
            },
            type: sequelize_1.QueryTypes.INSERT
        });
        // 直接返回插入的結果
        const insertedRentalStandard = result[0];
        if (insertedRentalStandard && insertedRentalStandard.id) {
            const newRentalStandard = await connection_1.default.query(`
                SELECT 
                    rs.*,
                    i.name as investment_name,
                    i.type as investment_type
                FROM rental_standards rs
                LEFT JOIN investments i ON rs."investmentId" = i.id
                WHERE rs.id = :id
            `, {
                replacements: { id: insertedRentalStandard.id },
                type: sequelize_1.QueryTypes.SELECT
            });
            res.status(201).json(newRentalStandard[0]);
        }
        else {
            // 如果沒有返回 ID，直接返回插入的資料
            res.status(201).json(insertedRentalStandard);
        }
    }
    catch (error) {
        console.error('創建租賃標準失敗:', error);
        res.status(400).json({ error: '創建租賃標準失敗' });
    }
});
// 更新租賃標準
router.put('/:id', async (req, res) => {
    try {
        // 檢查租賃標準是否存在
        const checkQuery = 'SELECT id FROM rental_standards WHERE id = :id';
        const existing = await connection_1.default.query(checkQuery, {
            replacements: { id: req.params.id },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (existing.length === 0) {
            return res.status(404).json({ error: '租賃標準不存在' });
        }
        const { investmentId, monthlyRent, startDate, endDate, renterName, renterTaxId, note } = req.body;
        const updateQuery = `
            UPDATE rental_standards SET
                "investmentId" = :investmentId,
                "monthlyRent" = :monthlyRent,
                "startDate" = :startDate,
                "endDate" = :endDate,
                "renterName" = :renterName,
                "renterTaxId" = :renterTaxId,
                note = :note,
                "updatedAt" = NOW()
            WHERE id = :id
        `;
        await connection_1.default.query(updateQuery, {
            replacements: {
                id: req.params.id,
                investmentId,
                monthlyRent,
                startDate,
                endDate,
                renterName,
                renterTaxId,
                note
            },
            type: sequelize_1.QueryTypes.UPDATE
        });
        // 獲取更新後的租賃標準
        const updatedRentalStandard = await connection_1.default.query(`
            SELECT 
                rs.*,
                i.name as investment_name,
                i.type as investment_type
            FROM rental_standards rs
            LEFT JOIN investments i ON rs."investmentId" = i.id
            WHERE rs.id = :id
        `, {
            replacements: { id: req.params.id },
            type: sequelize_1.QueryTypes.SELECT
        });
        res.json(updatedRentalStandard[0]);
    }
    catch (error) {
        console.error('更新租賃標準失敗:', error);
        res.status(400).json({ error: '更新租賃標準失敗' });
    }
});
// 刪除租賃標準
router.delete('/:id', async (req, res) => {
    try {
        // 檢查租賃標準是否存在
        const checkQuery = 'SELECT id FROM rental_standards WHERE id = :id';
        const existing = await connection_1.default.query(checkQuery, {
            replacements: { id: req.params.id },
            type: sequelize_1.QueryTypes.SELECT
        });
        if (existing.length === 0) {
            return res.status(404).json({ error: '租賃標準不存在' });
        }
        // 刪除租賃標準
        const deleteQuery = 'DELETE FROM rental_standards WHERE id = :id';
        await connection_1.default.query(deleteQuery, {
            replacements: { id: req.params.id },
            type: sequelize_1.QueryTypes.DELETE
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('刪除租賃標準失敗:', error);
        res.status(500).json({ error: '刪除租賃標準失敗' });
    }
});
exports.default = router;
