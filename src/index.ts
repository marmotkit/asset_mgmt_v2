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
import profitSharingRoutes from './routes/profit-sharing.routes';
import rentalPaymentsRoutes from './routes/rental-payments.routes';
import memberProfitRoutes from './routes/member-profit.routes';
import feeRoutes from './routes/fee.routes';
import feeSettingsRoutes from './routes/fee-settings.routes';
import documentsRoutes from './routes/documents.routes';
import annualActivitiesRoutes from './routes/annual-activities.routes';
import activityRegistrationsRoutes from './routes/activity-registrations.routes';
import memberCaresRoutes from './routes/member-cares.routes';
import riskManagementRoutes from './routes/risk-management.routes';
import anomaliesRoutes from './routes/anomalies.routes';

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
app.use('/api/profit-sharing-standards', profitSharingRoutes);
app.use('/api/rental-payments', rentalPaymentsRoutes);
app.use('/api/member-profits', memberProfitRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/fee-settings', feeSettingsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/annual-activities', annualActivitiesRoutes);
app.use('/api/activity-registrations', activityRegistrationsRoutes);
app.use('/api/member-cares', memberCaresRoutes);
app.use('/api/risk-management', riskManagementRoutes);
app.use('/api/anomalies', anomaliesRoutes);

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

        // 檢查並建立/修正 anomalies 表
        try {
            const [anomalyResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'anomalies';
            `);

            if (anomalyResults.length === 0) {
                console.log('建立 anomalies 資料表...');
                await sequelize.query(`
                    CREATE TABLE anomalies (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        type VARCHAR(255) NOT NULL,
                        person_id VARCHAR(255),
                        person_name VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        occurrence_date DATE NOT NULL,
                        status VARCHAR(255) NOT NULL DEFAULT '待處理',
                        handling_method TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                console.log('anomalies 資料表建立成功');
            } else {
                // 檢查欄位結構是否正確
                const [columns] = await sequelize.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'anomalies'
                    AND column_name = 'type';
                `);

                if (columns.length === 0) {
                    console.log('anomalies 資料表結構不正確，重新建立...');
                    await sequelize.query('DROP TABLE IF EXISTS anomalies CASCADE');
                    await sequelize.query(`
                        CREATE TABLE anomalies (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            type VARCHAR(255) NOT NULL,
                            person_id VARCHAR(255),
                            person_name VARCHAR(255) NOT NULL,
                            description TEXT NOT NULL,
                            occurrence_date DATE NOT NULL,
                            status VARCHAR(255) NOT NULL DEFAULT '待處理',
                            handling_method TEXT,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    console.log('anomalies 資料表重新建立成功');
                } else {
                    console.log('anomalies 資料表已存在且結構正確');
                }
            }
        } catch (error) {
            console.error('檢查/建立 anomalies 表時發生錯誤:', error);
        }

        // 檢查並建立 anomaly_changes 表（修改記錄）
        try {
            const [changeResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'anomaly_changes';
            `);

            if (changeResults.length === 0) {
                console.log('建立 anomaly_changes 資料表...');
                await sequelize.query(`
                    CREATE TABLE anomaly_changes (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        anomaly_id UUID NOT NULL,
                        changed_by VARCHAR(255) NOT NULL,
                        changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        field_name VARCHAR(255) NOT NULL,
                        old_value TEXT,
                        new_value TEXT,
                        change_reason TEXT,
                        FOREIGN KEY (anomaly_id) REFERENCES anomalies(id) ON DELETE CASCADE
                    );
                `);
                console.log('anomaly_changes 資料表建立成功');
            } else {
                console.log('anomaly_changes 資料表已存在');
            }
        } catch (error) {
            console.error('檢查/建立 anomaly_changes 表時發生錯誤:', error);
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
            } else {
                console.log('✓ 管理員帳號已存在');
            }
        } catch (error) {
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