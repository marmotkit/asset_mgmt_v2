"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 獲取所有會費標準
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const feeSettings = await models_1.FeeSetting.findAll({
            order: [["order", "ASC"], ["id", "ASC"]]
        });
        res.json(feeSettings);
    }
    catch (error) {
        console.error('獲取會費標準失敗:', error);
        res.status(500).json({ error: '獲取會費標準失敗' });
    }
});
// 獲取單一會費標準
router.get('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const feeSetting = await models_1.FeeSetting.findByPk(req.params.id);
        if (!feeSetting) {
            return res.status(404).json({ error: '會費標準不存在' });
        }
        res.json(feeSetting);
    }
    catch (error) {
        console.error('獲取會費標準失敗:', error);
        res.status(500).json({ error: '獲取會費標準失敗' });
    }
});
// 創建會費標準
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { memberType, amount, period, description, order } = req.body;
        // 驗證必填欄位
        if (!memberType || !amount || !period) {
            return res.status(400).json({
                error: '會員類型、金額和期間為必填欄位'
            });
        }
        // 檢查是否已存在相同會員類型
        const existingSetting = await models_1.FeeSetting.findOne({
            where: { memberType }
        });
        if (existingSetting) {
            return res.status(400).json({
                error: '該會員類型已存在會費標準'
            });
        }
        const feeSetting = await models_1.FeeSetting.create({
            memberType,
            amount,
            period,
            description,
            order: order || 0
        });
        res.status(201).json(feeSetting);
    }
    catch (error) {
        console.error('創建會費標準失敗:', error);
        res.status(500).json({ error: '創建會費標準失敗' });
    }
});
// 更新會費標準
router.put('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { memberType, amount, period, description, order } = req.body;
        const feeSetting = await models_1.FeeSetting.findByPk(req.params.id);
        if (!feeSetting) {
            return res.status(404).json({ error: '會費標準不存在' });
        }
        // 如果修改了會員類型，檢查是否與其他記錄衝突
        if (memberType && memberType !== feeSetting.memberType) {
            const existingSetting = await models_1.FeeSetting.findOne({
                where: {
                    memberType,
                    id: { [require('sequelize').Op.ne]: req.params.id }
                }
            });
            if (existingSetting) {
                return res.status(400).json({
                    error: '該會員類型已存在會費標準'
                });
            }
        }
        await feeSetting.update({
            memberType: memberType || feeSetting.memberType,
            amount: amount || feeSetting.amount,
            period: period || feeSetting.period,
            description: description !== undefined ? description : feeSetting.description,
            order: order !== undefined ? order : feeSetting.order
        });
        res.json(feeSetting);
    }
    catch (error) {
        console.error('更新會費標準失敗:', error);
        res.status(500).json({ error: '更新會費標準失敗' });
    }
});
// 刪除會費標準
router.delete('/:id', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const feeSetting = await models_1.FeeSetting.findByPk(req.params.id);
        if (!feeSetting) {
            return res.status(404).json({ error: '會費標準不存在' });
        }
        await feeSetting.destroy();
        res.json({ message: '會費標準已刪除' });
    }
    catch (error) {
        console.error('刪除會費標準失敗:', error);
        res.status(500).json({ error: '刪除會費標準失敗' });
    }
});
// 單筆排序（上下箭頭）
router.patch('/:id/order', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { order } = req.body;
        const feeSetting = await models_1.FeeSetting.findByPk(req.params.id);
        if (!feeSetting) {
            return res.status(404).json({ error: '會費標準不存在' });
        }
        await feeSetting.update({ order });
        res.json(feeSetting);
    }
    catch (error) {
        console.error('更新排序失敗:', error);
        res.status(500).json({ error: '更新排序失敗' });
    }
});
// 批次排序（拖曳）
router.patch('/reorder', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { orders } = req.body; // [{id, order}]
        if (!Array.isArray(orders)) {
            return res.status(400).json({ error: 'orders 必須為陣列' });
        }
        const updatePromises = orders.map(item => models_1.FeeSetting.update({ order: item.order }, { where: { id: item.id } }));
        await Promise.all(updatePromises);
        res.json({ message: '排序已更新' });
    }
    catch (error) {
        console.error('批次更新排序失敗:', error);
        res.status(500).json({ error: '批次更新排序失敗' });
    }
});
exports.default = router;
