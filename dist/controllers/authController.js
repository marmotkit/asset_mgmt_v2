"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// 登入
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: '請提供用戶名和密碼' });
        }
        // 查找用戶
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: '用戶名或密碼不正確' });
        }
        // 驗證密碼
        if (!user.password) {
            return res.status(401).json({ message: '用戶帳號設置錯誤' });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '用戶名或密碼不正確' });
        }
        // 創建 JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        // 移除密碼後返回用戶信息
        const userWithoutPassword = user.toJSON();
        delete userWithoutPassword.password;
        res.status(200).json({
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};
exports.login = login;
// 註冊
const register = async (req, res) => {
    try {
        const { username, password, name, email, role } = req.body;
        // 基本驗證
        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: '所有字段都是必填的' });
        }
        // 檢查用戶名是否已存在
        const existingUser = await User_1.default.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: '用戶名已存在' });
        }
        // 檢查電子郵件是否已存在
        const existingEmail = await User_1.default.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: '電子郵件已存在' });
        }
        // 生成會員編號
        const memberNo = await generateMemberNo(role);
        // 密碼加密
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // 創建用戶
        const newUser = await User_1.default.create({
            username,
            password: hashedPassword,
            name,
            email,
            role,
            memberNo,
            isFirstLogin: true,
            preferences: '[]',
            status: User_1.UserStatus.ACTIVE
        });
        // 創建 JWT
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
        // 移除密碼後返回用戶信息
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;
        res.status(201).json({
            message: '註冊成功',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
};
exports.register = register;
// 生成會員編號
const generateMemberNo = async (role) => {
    // 定義角色前綴
    const rolePrefix = {
        admin: 'A',
        normal: 'C',
        business: 'B',
        lifetime: 'L'
    };
    const prefix = rolePrefix[role] || 'C';
    // 查找同一角色的最後一個用戶
    const users = await User_1.default.findAll({ where: { role } });
    const count = users.length;
    // 生成新的會員編號
    const paddedCount = String(count + 1).padStart(3, '0');
    return `${prefix}${paddedCount}`;
};
