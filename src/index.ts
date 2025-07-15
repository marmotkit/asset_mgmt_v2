import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db/connection';
import Fee from './models/Fee';
// @ts-ignore
const sequelizePkg = require('sequelize');

console.log('Sequelize version:', sequelizePkg.version);
console.log('Node version:', process.version);
console.log('Fee prototype:', Object.getOwnPropertyNames(Fee.prototype));

// 初始化模型
import './models';

// 路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import investmentRoutes from './routes/investment.routes';
import rentalRoutes from './routes/rental.routes';
import feeRoutes from './routes/fee.routes';
import feeSettingsRoutes from './routes/fee-settings.routes';
import documentsRoutes from './routes/documents.routes';

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/rental-standards', rentalRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/fee-settings', feeSettingsRoutes);
app.use('/api/documents', documentsRoutes);

// 基本路由測試
app.get('/', (req, res) => {
    res.send('資產管理系統 API 服務運行中');
});

// 啟動時同步所有 Sequelize model，確保 model 註冊正確
sequelize.sync({ alter: false })
    .then(async () => {
        console.log('資料庫同步成功');

        // 檢查並建立 fees 表（如果不存在）
        try {
            const [results] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'fees';
            `);

            if (results.length === 0) {
                console.log('建立 fees 資料表...');
                await sequelize.query(`
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
            } else {
                console.log('fees 資料表已存在');
            }
        } catch (error) {
            console.error('檢查/建立 fees 表時發生錯誤:', error);
        }

        // 檢查並建立 documents 表（如果不存在）
        try {
            const [docResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'documents';
            `);

            if (docResults.length === 0) {
                console.log('建立 documents 資料表...');
                await sequelize.query(`
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
            } else {
                console.log('documents 資料表已存在');
            }
        } catch (error) {
            console.error('檢查/建立 documents 表時發生錯誤:', error);
        }

        // 投資資料遷移已完成，不再自動插入測試資料
        console.log('投資資料表已準備就緒');

        app.listen(PORT, () => {
            console.log(`服務器運行在 port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('資料庫同步錯誤:', error);
    }); 