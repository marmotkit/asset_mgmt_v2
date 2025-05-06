const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const User = require('../models/User');
const { UserRole } = require('../models/User');

// 獲取所有用戶 (僅限管理員)
router.get('/', authMiddleware, checkRole([UserRole.ADMIN]), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error('獲取用戶列表錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 獲取單個用戶
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 只有管理員可以查看其他用戶
        if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
            return res.status(403).json({ message: '您沒有權限查看此用戶' });
        }

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        res.json(user);
    } catch (error) {
        console.error('獲取用戶詳情錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 更新用戶
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 只有管理員或本人可以更新用戶
        if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
            return res.status(403).json({ message: '您沒有權限更新此用戶' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        // 只有管理員可以修改用戶角色和狀態
        if (req.user.role !== UserRole.ADMIN) {
            delete req.body.role;
            delete req.body.status;
        }

        // 更新用戶信息
        await user.update(req.body);

        // 移除密碼後返回用戶信息
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;

        res.json(userWithoutPassword);
    } catch (error) {
        console.error('更新用戶錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 刪除用戶 (僅限管理員)
router.delete('/:id', authMiddleware, checkRole([UserRole.ADMIN]), async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        // 防止刪除自己
        if (req.user.id === id) {
            return res.status(400).json({ message: '不能刪除自己的帳號' });
        }

        await user.destroy();

        res.json({ message: '用戶已成功刪除' });
    } catch (error) {
        console.error('刪除用戶錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

module.exports = router; 