const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = async (req, res, next) => {
    try {
        // 檢查 Authorization 頭部
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: '缺少授權令牌' });
        }

        // 提取令牌
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '缺少有效的令牌' });
        }

        // 驗證令牌
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: '無效或過期的令牌' });
        }

        // 檢查用戶是否存在
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: '用戶不存在' });
        }

        // 檢查用戶狀態
        if (user.status !== 'active') {
            return res.status(403).json({ message: '用戶賬號已被停用' });
        }

        // 將用戶信息附加到請求對象上
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        next();
    } catch (error) {
        console.error('認證中間件錯誤', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};

// 權限檢查中間件
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: '請先登入' });
        }

        if (roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ message: '您沒有權限訪問此資源' });
    };
};

module.exports = { authMiddleware, checkRole }; 