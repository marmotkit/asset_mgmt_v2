import express from 'express';
import Investment from '../models/Investment';
import Company from '../models/Company';
import User from '../models/User';

const router = express.Router();

// 獲取所有投資項目
router.get('/', async (req, res) => {
    try {
        const { QueryTypes } = require('sequelize');
        const sequelize = require('../db/connection').default;

        const query = `
            SELECT 
                i.*,
                c.name as company_name,
                c."companyNo" as company_no,
                u.name as user_name,
                u."memberNo" as user_member_no
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            ORDER BY i."createdAt" DESC
        `;

        const investments = await sequelize.query(query, {
            type: QueryTypes.SELECT
        });

        res.json(investments);
    } catch (error) {
        console.error('獲取投資項目失敗:', error);
        res.status(500).json({ error: '獲取投資項目失敗' });
    }
});

// 獲取單個投資項目
router.get('/:id', async (req, res) => {
    try {
        const { QueryTypes } = require('sequelize');
        const sequelize = require('../db/connection').default;

        const query = `
            SELECT 
                i.*,
                c.name as company_name,
                c."companyNo" as company_no,
                u.name as user_name,
                u."memberNo" as user_member_no
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            WHERE i.id = :id
        `;

        const investments = await sequelize.query(query, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (investments.length === 0) {
            return res.status(404).json({ error: '投資項目不存在' });
        }

        res.json(investments[0]);
    } catch (error) {
        console.error('獲取投資項目失敗:', error);
        res.status(500).json({ error: '獲取投資項目失敗' });
    }
});

// 創建投資項目
router.post('/', async (req, res) => {
    try {
        const { QueryTypes } = require('sequelize');
        const sequelize = require('../db/connection').default;

        const {
            companyId,
            userId,
            type,
            name,
            description,
            amount,
            startDate,
            endDate,
            status,
            assetType,
            serialNumber,
            manufacturer,
            location,
            area,
            propertyType,
            registrationNumber
        } = req.body;

        const query = `
            INSERT INTO investments (
                id, "companyId", "userId", type, name, description, amount, 
                "startDate", "endDate", status, "createdAt", "updatedAt"
            ) VALUES (
                gen_random_uuid(), :companyId, :userId, :type, :name, :description, :amount,
                :startDate, :endDate, :status, NOW(), NOW()
            ) RETURNING *
        `;

        const result = await sequelize.query(query, {
            replacements: {
                companyId,
                userId,
                type,
                name,
                description,
                amount,
                startDate,
                endDate,
                status: status || 'active',
                assetType,
                serialNumber,
                manufacturer,
                location,
                area,
                propertyType,
                registrationNumber
            },
            type: QueryTypes.INSERT
        });

        // 獲取新創建的投資項目
        const newInvestment = await sequelize.query(`
            SELECT 
                i.*,
                c.name as company_name,
                c."companyNo" as company_no,
                u.name as user_name,
                u."memberNo" as user_member_no
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            WHERE i.id = :id
        `, {
            replacements: { id: result[0].id },
            type: QueryTypes.SELECT
        });

        res.status(201).json(newInvestment[0]);
    } catch (error) {
        console.error('創建投資項目失敗:', error);
        res.status(400).json({ error: '創建投資項目失敗' });
    }
});

// 更新投資項目
router.put('/:id', async (req, res) => {
    try {
        const { QueryTypes } = require('sequelize');
        const sequelize = require('../db/connection').default;

        // 檢查投資項目是否存在
        const checkQuery = 'SELECT id FROM investments WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '投資項目不存在' });
        }

        const {
            companyId,
            userId,
            type,
            name,
            description,
            amount,
            startDate,
            endDate,
            status,
            assetType,
            serialNumber,
            manufacturer,
            location,
            area,
            propertyType,
            registrationNumber
        } = req.body;

        const updateQuery = `
            UPDATE investments SET
                "companyId" = :companyId,
                "userId" = :userId,
                type = :type,
                name = :name,
                description = :description,
                amount = :amount,
                "startDate" = :startDate,
                "endDate" = :endDate,
                status = :status,
                "updatedAt" = NOW()
            WHERE id = :id
        `;

        await sequelize.query(updateQuery, {
            replacements: {
                id: req.params.id,
                companyId,
                userId,
                type,
                name,
                description,
                amount,
                startDate,
                endDate,
                status,
                assetType,
                serialNumber,
                manufacturer,
                location,
                area,
                propertyType,
                registrationNumber
            },
            type: QueryTypes.UPDATE
        });

        // 獲取更新後的投資項目
        const updatedInvestment = await sequelize.query(`
            SELECT 
                i.*,
                c.name as company_name,
                c."companyNo" as company_no,
                u.name as user_name,
                u."memberNo" as user_member_no
            FROM investments i
            LEFT JOIN companies c ON i."companyId" = c.id
            LEFT JOIN users u ON i."userId" = u.id
            WHERE i.id = :id
        `, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        res.json(updatedInvestment[0]);
    } catch (error) {
        console.error('更新投資項目失敗:', error);
        res.status(400).json({ error: '更新投資項目失敗' });
    }
});

// 刪除投資項目
router.delete('/:id', async (req, res) => {
    try {
        const { QueryTypes } = require('sequelize');
        const sequelize = require('../db/connection').default;

        // 檢查投資項目是否存在
        const checkQuery = 'SELECT id FROM investments WHERE id = :id';
        const existing = await sequelize.query(checkQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });

        if (existing.length === 0) {
            return res.status(404).json({ error: '投資項目不存在' });
        }

        // 刪除投資項目
        const deleteQuery = 'DELETE FROM investments WHERE id = :id';
        await sequelize.query(deleteQuery, {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });

        res.status(204).send();
    } catch (error) {
        console.error('刪除投資項目失敗:', error);
        res.status(500).json({ error: '刪除投資項目失敗' });
    }
});

export default router;
