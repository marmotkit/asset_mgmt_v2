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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const memberNoGenerator_1 = require("../utils/memberNoGenerator");
const connection_1 = __importDefault(require("../db/connection"));
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
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
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
            status: User_1.UserStatus.ACTIVE
        });
        const newUser = await User_1.default.create({
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
        // 暫時排除 plainPassword 欄位，避免資料庫欄位不存在的錯誤
        const users = await User_1.default.findAll({
            attributes: [
                'id', 'memberNo', 'username', 'name', 'email',
                'role', 'status', 'companyId', 'isFirstLogin',
                'preferences', 'createdAt', 'updatedAt'
            ]
        });
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
// 重設用戶密碼
router.put('/:id/password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: '新密碼為必填項' });
        }
        const user = await User_1.default.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }
        // 加密新密碼
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // 更新密碼
        await user.update({
            password: hashedPassword,
            plainPassword: password // 同時更新明文密碼
        });
        res.status(200).json({ message: '密碼重設成功' });
    }
    catch (error) {
        console.error('重設密碼錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
// 查詢用戶密碼
router.get('/:id/password', async (req, res) => {
    try {
        // 先檢查資料庫是否有 plainPassword 欄位
        const [results] = await connection_1.default.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'plainPassword';
        `);
        const hasPlainPasswordColumn = results.length > 0;
        if (hasPlainPasswordColumn) {
            // 如果有 plainPassword 欄位，查詢該欄位
            const user = await User_1.default.findByPk(req.params.id, {
                attributes: ['id', 'plainPassword']
            });
            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }
            if (user.plainPassword) {
                res.status(200).json({
                    message: '密碼查詢成功',
                    password: user.plainPassword
                });
            }
            else {
                res.status(200).json({
                    message: '密碼查詢成功',
                    password: '密碼未設定'
                });
            }
        }
        else {
            // 如果沒有 plainPassword 欄位，只檢查用戶是否存在
            const user = await User_1.default.findByPk(req.params.id, {
                attributes: ['id']
            });
            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }
            res.status(200).json({
                message: '密碼查詢成功',
                password: '密碼已加密，無法顯示明文'
            });
        }
    }
    catch (error) {
        console.error('查詢密碼錯誤:', error);
        res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
});
// 執行資料庫遷移（僅用於開發/測試）
router.post('/migrate/plain-password', async (req, res) => {
    try {
        console.log('開始執行 plainPassword 欄位遷移...');
        // 檢查是否已經存在 plainPassword 欄位
        const [existingColumns] = await connection_1.default.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'plainPassword';
        `);
        if (existingColumns.length > 0) {
            console.log('✅ plainPassword 欄位已存在，跳過遷移');
            return res.status(200).json({
                message: 'plainPassword 欄位已存在，無需遷移',
                success: true
            });
        }
        // 新增 plainPassword 欄位
        console.log('新增 plainPassword 欄位...');
        await connection_1.default.query(`
            ALTER TABLE users 
            ADD COLUMN "plainPassword" VARCHAR(255);
        `);
        console.log('✅ plainPassword 欄位新增成功！');
        // 為現有用戶設定預設明文密碼（基於用戶名）
        console.log('為現有用戶設定預設明文密碼...');
        const [users] = await connection_1.default.query(`
            SELECT id, username, "plainPassword" 
            FROM users 
            WHERE "plainPassword" IS NULL OR "plainPassword" = '';
        `);
        const updatedUsers = [];
        for (const user of users) {
            // 為每個用戶設定預設密碼為用戶名 + '123'
            const defaultPassword = user.username + '123';
            await connection_1.default.query(`
                UPDATE users 
                SET "plainPassword" = $1 
                WHERE id = $2
            `, {
                bind: [defaultPassword, user.id]
            });
            updatedUsers.push({ username: user.username, password: defaultPassword });
            console.log(`✅ 用戶 ${user.username} 密碼設定為: ${defaultPassword}`);
        }
        console.log('✅ 所有用戶的預設明文密碼設定完成！');
        res.status(200).json({
            message: 'plainPassword 欄位遷移成功',
            success: true,
            updatedUsers: updatedUsers
        });
    }
    catch (error) {
        console.error('❌ 遷移過程中發生錯誤:', error);
        res.status(500).json({
            message: '遷移失敗',
            error: error.message,
            success: false
        });
    }
});
exports.default = router;
