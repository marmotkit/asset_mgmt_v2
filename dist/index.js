"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = __importDefault(require("./db/connection"));
const Fee_1 = __importDefault(require("./models/Fee"));
// @ts-ignore
const sequelizePkg = require('sequelize');
console.log('Sequelize version:', sequelizePkg.version);
console.log('Node version:', process.version);
console.log('Fee prototype:', Object.getOwnPropertyNames(Fee_1.default.prototype));
// 初始化模型
require("./models");
// 路由
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const investment_routes_1 = __importDefault(require("./routes/investment.routes"));
const rental_routes_1 = __importDefault(require("./routes/rental.routes"));
const profit_sharing_routes_1 = __importDefault(require("./routes/profit-sharing.routes"));
const rental_payments_routes_1 = __importDefault(require("./routes/rental-payments.routes"));
const member_profit_routes_1 = __importDefault(require("./routes/member-profit.routes"));
const fee_routes_1 = __importDefault(require("./routes/fee.routes"));
const fee_settings_routes_1 = __importDefault(require("./routes/fee-settings.routes"));
const documents_routes_1 = __importDefault(require("./routes/documents.routes"));
// 加載環境變量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中間件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 路由
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/companies', company_routes_1.default);
app.use('/api/investments', investment_routes_1.default);
app.use('/api/rental-standards', rental_routes_1.default);
app.use('/api/profit-sharing-standards', profit_sharing_routes_1.default);
app.use('/api/rental-payments', rental_payments_routes_1.default);
app.use('/api/member-profits', member_profit_routes_1.default);
app.use('/api/fees', fee_routes_1.default);
app.use('/api/fee-settings', fee_settings_routes_1.default);
app.use('/api/documents', documents_routes_1.default);
// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});
// 啟動時同步所有 Sequelize model，確保 model 註冊正確
connection_1.default.sync({ alter: false })
    .then(async () => {
    console.log('資料庫同步成功');
    // 檢查並建立 fees 表（如果不存在）
    try {
        const [results] = await connection_1.default.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'fees';
            `);
        if (results.length === 0) {
            console.log('建立 fees 資料表...');
            await connection_1.default.query(`
                    CREATE TABLE fees (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        member_id VARCHAR(255) NOT NULL,
                        member_no VARCHAR(255) NOT NULL,
                        member_name VARCHAR(255) NOT NULL,
                        member_type VARCHAR(255) NOT NULL,
                        amount DECIMAL(12,2) NOT NULL,
                        due_date DATE NOT NULL,
                        status VARCHAR(255) NOT NULL DEFAULT 'pending',
                        note TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
            console.log('fees 資料表建立成功');
        }
        else {
            console.log('fees 資料表已存在');
        }
    }
    catch (error) {
        console.error('檢查/建立 fees 表時發生錯誤:', error);
    }
    // 檢查並建立 documents 表（如果不存在）
    try {
        const [docResults] = await connection_1.default.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'documents';
            `);
        if (docResults.length === 0) {
            console.log('建立 documents 資料表...');
            await connection_1.default.query(`
                    CREATE TABLE documents (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        type VARCHAR(255) NOT NULL,
                        member_id VARCHAR(255) NOT NULL,
                        member_name VARCHAR(255) NOT NULL,
                        payment_id VARCHAR(255),
                        invoice_number VARCHAR(255),
                        receipt_number VARCHAR(255),
                        amount DECIMAL(12,2) NOT NULL,
                        date DATE NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
            console.log('documents 資料表建立成功');
        }
        else {
            console.log('documents 資料表已存在');
        }
    }
    catch (error) {
        console.error('檢查/建立 documents 表時發生錯誤:', error);
    }
    // 投資資料遷移已完成，不再自動插入測試資料
    console.log('投資資料表已準備就緒');
    // 確保預設管理員帳號存在
    try {
        const bcrypt = require('bcryptjs');
        const User = require('./models/User').default;
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                memberNo: 'A001',
                username: 'admin',
                password: hashedPassword,
                name: '系統管理員',
                email: 'admin@example.com',
                role: 'admin',
                status: 'active',
                isFirstLogin: false,
                preferences: '[]'
            });
            console.log('✓ 預設管理員帳號建立成功 (admin/admin123)');
        }
        else {
            console.log('✓ 管理員帳號已存在');
        }
    }
    catch (error) {
        console.error('建立預設管理員帳號時發生錯誤:', error);
    }
    // 修正 member_profits 表的 ENUM 類型
    // try {
    //     const fixMemberProfitsEnum = require('./scripts/fix-member-profits-enum');
    //     await fixMemberProfitsEnum();
    // } catch (error) {
    //     console.error('修正 member_profits 表 ENUM 時發生錯誤:', error);
    // }
    app.listen(PORT, () => {
        console.log(`服務器運行在 port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('資料庫同步錯誤:', error);
});
