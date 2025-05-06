"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authMiddleware = (req, res, next) => {
    // 獲取令牌
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '未提供認證令牌' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // 驗證令牌
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('令牌驗證錯誤:', error);
        res.status(401).json({ message: '無效的令牌' });
    }
};
exports.authMiddleware = authMiddleware;
// 管理員權限檢查中間件
const adminAuthMiddleware = (req, res, next) => {
    // 首先進行身份驗證
    (0, exports.authMiddleware)(req, res, () => {
        // 檢查是否是管理員
        if (req.user && req.user.role === 'admin') {
            next();
        }
        else {
            res.status(403).json({ message: '需要管理員權限' });
        }
    });
};
exports.adminAuthMiddleware = adminAuthMiddleware;
