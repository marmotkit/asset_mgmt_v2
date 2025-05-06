import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 擴展 Request 類型以包含 user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 獲取令牌
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未提供認證令牌' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 驗證令牌
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('令牌驗證錯誤:', error);
        res.status(401).json({ message: '無效的令牌' });
    }
};

// 管理員權限檢查中間件
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 首先進行身份驗證
    authMiddleware(req, res, () => {
        // 檢查是否是管理員
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: '需要管理員權限' });
        }
    });
}; 