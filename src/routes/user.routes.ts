import { Router } from 'express';
import User, { UserStatus } from '../models/User';
import bcrypt from 'bcryptjs';
import { generateMemberNo } from '../utils/memberNoGenerator';
import { UserRole } from '../types/user';

const router = Router();

// 創建新用戶
router.post('/', async (req, res) => {
    try {
        console.log('收到創建用戶請求:', req.body);
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
        console.log('生成的會員編號:', memberNo);

        // 密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('密碼加密完成');

        // 處理 companyId，如果是空字符串則設為 null
        const processedCompanyId = companyId && companyId.trim() !== '' ? companyId : null;

        // 創建用戶
        console.log('準備創建用戶，數據:', {
            username,
            name,
            email,
            role: role || 'normal',
            memberNo,
            companyId: processedCompanyId,
            isFirstLogin: true,
            preferences: '[]',
            status: UserStatus.ACTIVE
        });

        const newUser = await User.create({
            username,
            password: hashedPassword,
            plainPassword: password, // 儲存明文密碼
            name,
            email,
            role: role || 'normal',
            memberNo,
            companyId: processedCompanyId,
            isFirstLogin: true,
            preferences: '[]',
            status: UserStatus.ACTIVE
        });

        // 移除密碼後返回用戶信息
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;
        console.log('用戶創建成功:', userWithoutPassword);

        res.status(201).json({
            message: '用戶創建成功',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('創建用戶錯誤:', error);
        console.error('錯誤詳情:', error instanceof Error ? error.message : '未知錯誤');
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

// 重設用戶密碼
router.put('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: '新密碼為必填項' });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        // 加密新密碼
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 更新密碼
        await user.update({
            password: hashedPassword,
            plainPassword: password // 同時更新明文密碼
        });

        res.status(200).json({ message: '密碼重設成功' });
    } catch (error) {
        console.error('重設密碼錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

// 查詢用戶密碼
router.get('/:id/password', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        // 返回明文密碼（注意：這是為了管理員查詢，實際應用中應該謹慎處理）
        res.status(200).json({
            message: '密碼查詢成功',
            password: user.plainPassword || '密碼未設定'
        });
    } catch (error) {
        console.error('查詢密碼錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});

export default router; 