import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserStatus } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 登入
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: '請提供用戶名和密碼' });
        }

        // 查找用戶
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: '用戶名或密碼不正確' });
        }

        // 驗證密碼
        if (!user.password) {
            return res.status(401).json({ message: '用戶帳號設置錯誤' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: '用戶名或密碼不正確' });
        }

        // 創建 JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 移除密碼後返回用戶信息
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;

        res.status(200).json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 註冊
export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, name, email, role } = req.body;

        // 基本驗證
        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: '所有字段都是必填的' });
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

        // 生成會員編號
        const memberNo = await generateMemberNo(role);

        // 密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 創建用戶
        const newUser = await User.create({
            username,
            password: hashedPassword,
            name,
            email,
            role,
            memberNo,
            isFirstLogin: true,
            preferences: '[]',
            status: UserStatus.ACTIVE
        });

        // 創建 JWT
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 移除密碼後返回用戶信息
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;

        res.status(201).json({
            message: '註冊成功',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 生成會員編號
const generateMemberNo = async (role: string): Promise<string> => {
    // 定義角色前綴
    const rolePrefix: Record<string, string> = {
        admin: 'A',
        normal: 'C',
        business: 'B',
        lifetime: 'L'
    };

    const prefix = rolePrefix[role] || 'C';

    // 查找同一角色的最後一個用戶
    const users = await User.findAll({ where: { role } });
    const count = users.length;

    // 生成新的會員編號
    const paddedCount = String(count + 1).padStart(3, '0');
    return `${prefix}${paddedCount}`;
}; 