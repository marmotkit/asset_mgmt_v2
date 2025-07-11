import { Router } from 'express';
import User, { UserStatus } from '../models/User';
import bcrypt from 'bcrypt';
import { generateMemberNo } from '../utils/memberNoGenerator';
import { UserRole } from '../types/user';

const router = Router();

// 創建新用戶
router.post('/', async (req, res) => {
    try {
        const { username, password, name, email, role, companyId } = req.body;

        // 基本驗證
        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: '用戶名、密碼、姓名和電子郵件為必填項' });
        }

        // 檢查用戶名是否已存在
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: '用戶名已存在' });
        }

        // 檢查電子郵件是否已存在
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: '電子郵件已存在' });
        }

        // 獲取當前用戶數量以生成會員編號
        const currentCount = await User.count();

        // 生成會員編號
        const memberNo = await generateMemberNo((role || 'normal') as UserRole, currentCount);

        // 密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 創建用戶
        const newUser = await User.create({
            username,
            password: hashedPassword,
            name,
            email,
            role: role || 'normal',
            memberNo,
            companyId,
            isFirstLogin: true,
            preferences: '[]',
            status: UserStatus.ACTIVE
        });

        // 移除密碼後返回用戶信息
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;

        res.status(201).json({
            message: '用戶創建成功',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('創建用戶錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 獲取所有用戶
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('獲取用戶列表錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 獲取單個用戶
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('獲取用戶詳情錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 更新用戶
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        await user.update(req.body);

        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('更新用戶錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 刪除用戶
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        await user.destroy();

        res.status(200).json({ message: '用戶已刪除' });
    } catch (error) {
        console.error('刪除用戶錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

export default router; 