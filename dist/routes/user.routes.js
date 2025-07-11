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
const express_1 = require("express");
const User_1 = __importStar(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const memberNoGenerator_1 = require("../utils/memberNoGenerator");
const router = (0, express_1.Router)();
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
        const existingUser = await User_1.default.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: '用戶名已存在' });
        }
        // 檢查電子郵件是否已存在
        const existingEmail = await User_1.default.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: '電子郵件已存在' });
        }
        // 獲取當前用戶數量以生成會員編號
        const currentCount = await User_1.default.count();
        // 生成會員編號
        const memberNo = await (0, memberNoGenerator_1.generateMemberNo)((role || 'normal'), currentCount);
        console.log('生成的會員編號:', memberNo);
        // 密碼加密
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        console.log('密碼加密完成');
        // 創建用戶
        console.log('準備創建用戶，數據:', {
            username,
            name,
            email,
            role: role || 'normal',
            memberNo,
            companyId,
            isFirstLogin: true,
            preferences: '[]',
            status: User_1.UserStatus.ACTIVE
        });
        const newUser = await User_1.default.create({
            username,
            password: hashedPassword,
            name,
            email,
            role: role || 'normal',
            memberNo,
            companyId,
            isFirstLogin: true,
            preferences: '[]',
            status: User_1.UserStatus.ACTIVE
        });
        // 移除密碼後返回用戶信息
        const userWithoutPassword = newUser.toJSON();
        delete userWithoutPassword.password;
        console.log('用戶創建成功:', userWithoutPassword);
        res.status(201).json({
            message: '用戶創建成功',
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('創建用戶錯誤:', error);
        console.error('錯誤詳情:', error instanceof Error ? error.message : '未知錯誤');
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
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
