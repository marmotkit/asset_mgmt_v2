"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// 獲取所有用戶
router.get('/', async (req, res) => {
    try {
        const users = await User_1.default.findAll();
        res.status(200).json(users);
    }
    catch (error) {
        console.error('獲取用戶列表錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
// 獲取單個用戶
router.get('/:id', async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('獲取用戶詳情錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
// 更新用戶
router.put('/:id', async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }
        await user.update(req.body);
        const updatedUser = await User_1.default.findByPk(req.params.id);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('更新用戶錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
// 刪除用戶
router.delete('/:id', async (req, res) => {
    try {
        const user = await User_1.default.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }
        await user.destroy();
        res.status(200).json({ message: '用戶已刪除' });
    }
    catch (error) {
        console.error('刪除用戶錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
exports.default = router;
