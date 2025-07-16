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
import accountingAccountsRoutes from './routes/accounting-accounts.routes';
import accountingCategoriesRoutes from './routes/accounting-categories.routes';
import accountingJournalRoutes from './routes/accounting-journal.routes';
import accountingReceivablesRoutes from './routes/accounting-receivables.routes';
import accountingPayablesRoutes from './routes/accounting-payables.routes';
import accountingMonthlyClosingsRoutes from './routes/accounting-monthly-closings.routes';
import accountingReportsRoutes from './routes/accounting-reports.routes';
import investmentOpportunitiesRoutes from './routes/investment-opportunities.routes';
import investmentInquiriesRoutes from './routes/investment-inquiries.routes';

// 加載環境變量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/accounting/accounts', accountingAccountsRoutes);
app.use('/api/accounting/categories', accountingCategoriesRoutes);
app.use('/api/accounting/journal', accountingJournalRoutes);
app.use('/api/accounting/receivables', accountingReceivablesRoutes);
app.use('/api/accounting/payables', accountingPayablesRoutes);
app.use('/api/accounting/monthly-closings', accountingMonthlyClosingsRoutes);
app.use('/api/accounting/reports', accountingReportsRoutes);
app.use('/api', investmentOpportunitiesRoutes);
app.use('/api', investmentInquiriesRoutes);

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

        // 建立賬務管理相關資料表
        try {
            // 1. 建立會計科目表
            const [accountResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_accounts';
            `);

            if (accountResults.length === 0) {
                console.log('建立 accounting_accounts 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_accounts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        account_code VARCHAR(50) UNIQUE NOT NULL,
                        account_name VARCHAR(255) NOT NULL,
                        account_type VARCHAR(50) NOT NULL,
                        parent_account_id UUID,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (parent_account_id) REFERENCES accounting_accounts(id)
                    );
                `);
                console.log('accounting_accounts 資料表建立成功');
            } else {
                console.log('accounting_accounts 資料表已存在');
            }

            // 2. 建立交易類別表
            const [categoryResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_categories';
            `);

            if (categoryResults.length === 0) {
                console.log('建立 accounting_categories 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_categories (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        category_code VARCHAR(50) UNIQUE NOT NULL,
                        category_name VARCHAR(255) NOT NULL,
                        category_type VARCHAR(50) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                console.log('accounting_categories 資料表建立成功');
            } else {
                console.log('accounting_categories 資料表已存在');
            }

            // 3. 建立日記帳表
            const [journalResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_journal';
            `);

            if (journalResults.length === 0) {
                console.log('建立 accounting_journal 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_journal (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        journal_date DATE NOT NULL,
                        journal_number VARCHAR(50) UNIQUE NOT NULL,
                        reference_number VARCHAR(100),
                        description TEXT NOT NULL,
                        debit_account_id UUID NOT NULL,
                        credit_account_id UUID NOT NULL,
                        amount DECIMAL(15,2) NOT NULL,
                        category_id UUID,
                        created_by VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (debit_account_id) REFERENCES accounting_accounts(id),
                        FOREIGN KEY (credit_account_id) REFERENCES accounting_accounts(id),
                        FOREIGN KEY (category_id) REFERENCES accounting_categories(id)
                    );
            `);
                console.log('accounting_journal 資料表建立成功');
            } else {
                console.log('accounting_journal 資料表已存在');
            }

            // 4. 建立應收帳款表
            const [receivableResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_receivables';
            `);

            if (receivableResults.length === 0) {
                console.log('建立 accounting_receivables 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_receivables (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        customer_id VARCHAR(255) NOT NULL,
                        customer_name VARCHAR(255) NOT NULL,
                        invoice_number VARCHAR(100),
                        amount DECIMAL(15,2) NOT NULL,
                        due_date DATE NOT NULL,
                        status VARCHAR(50) DEFAULT 'pending',
                        payment_date DATE,
                        payment_amount DECIMAL(15,2),
                        remaining_amount DECIMAL(15,2) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                console.log('accounting_receivables 資料表建立成功');
            } else {
                console.log('accounting_receivables 資料表已存在');
            }

            // 5. 建立應付帳款表
            const [payableResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_payables';
            `);

            if (payableResults.length === 0) {
                console.log('建立 accounting_payables 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_payables (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        supplier_id VARCHAR(255) NOT NULL,
                        supplier_name VARCHAR(255) NOT NULL,
                        invoice_number VARCHAR(100),
                        amount DECIMAL(15,2) NOT NULL,
                        due_date DATE NOT NULL,
                        status VARCHAR(50) DEFAULT 'pending',
                        payment_date DATE,
                        payment_amount DECIMAL(15,2),
                        remaining_amount DECIMAL(15,2) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                console.log('accounting_payables 資料表建立成功');
            } else {
                console.log('accounting_payables 資料表已存在');
            }

            // 6. 建立月結記錄表
            const [closingResults] = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'accounting_monthly_closings';
            `);

            if (closingResults.length === 0) {
                console.log('建立 accounting_monthly_closings 資料表...');
                await sequelize.query(`
                    CREATE TABLE accounting_monthly_closings (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        closing_year INTEGER NOT NULL,
                        closing_month INTEGER NOT NULL,
                        closing_date DATE NOT NULL,
                        total_debit DECIMAL(15,2) NOT NULL,
                        total_credit DECIMAL(15,2) NOT NULL,
                        balance DECIMAL(15,2) NOT NULL,
                        status VARCHAR(50) DEFAULT 'open',
                        closed_by VARCHAR(255),
                        closed_at TIMESTAMP WITH TIME ZONE,
                        notes TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(closing_year, closing_month)
                    );
                `);
                console.log('accounting_monthly_closings 資料表建立成功');
            } else {
                console.log('accounting_monthly_closings 資料表已存在');
            }

            // 建立索引
            console.log('建立賬務管理資料表索引...');
            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS idx_journal_date ON accounting_journal(journal_date);
                CREATE INDEX IF NOT EXISTS idx_journal_accounts ON accounting_journal(debit_account_id, credit_account_id);
                CREATE INDEX IF NOT EXISTS idx_receivables_customer ON accounting_receivables(customer_id);
                CREATE INDEX IF NOT EXISTS idx_receivables_status ON accounting_receivables(status);
                CREATE INDEX IF NOT EXISTS idx_payables_supplier ON accounting_payables(supplier_id);
                CREATE INDEX IF NOT EXISTS idx_payables_status ON accounting_payables(status);
                CREATE INDEX IF NOT EXISTS idx_closings_year_month ON accounting_monthly_closings(closing_year, closing_month);
            `);
            console.log('賬務管理資料表索引建立完成');

        } catch (error) {
            console.error('建立賬務管理資料表時發生錯誤:', error);
        }

        // 初始化預設會計科目
        try {
            const [accountCount] = await sequelize.query(`
                SELECT COUNT(*) as count FROM accounting_accounts
            `);

            if (parseInt((accountCount[0] as any).count) === 0) {
                console.log('初始化預設會計科目...');
                await sequelize.query(`
                    INSERT INTO accounting_accounts (account_code, account_name, account_type, description) VALUES
                    ('1000', '現金', 'asset', '現金及約當現金'),
                    ('1100', '銀行存款', 'asset', '銀行活期存款'),
                    ('1200', '應收帳款', 'asset', '應收客戶款項'),
                    ('1300', '存貨', 'asset', '商品存貨'),
                    ('1400', '預付費用', 'asset', '預付各項費用'),
                    ('1500', '固定資產', 'asset', '房屋、設備等固定資產'),
                    ('2000', '應付帳款', 'liability', '應付供應商款項'),
                    ('2100', '應付薪資', 'liability', '應付員工薪資'),
                    ('2200', '應付稅款', 'liability', '應付各項稅款'),
                    ('3000', '股本', 'equity', '股東投入資本'),
                    ('3100', '保留盈餘', 'equity', '歷年累積盈餘'),
                    ('4000', '營業收入', 'revenue', '主要營業收入'),
                    ('4100', '其他收入', 'revenue', '非營業收入'),
                    ('5000', '營業成本', 'expense', '商品銷售成本'),
                    ('5100', '薪資費用', 'expense', '員工薪資支出'),
                    ('5200', '租金費用', 'expense', '辦公室租金'),
                    ('5300', '水電費用', 'expense', '水費、電費支出'),
                    ('5400', '廣告費用', 'expense', '廣告宣傳支出'),
                    ('5500', '其他費用', 'expense', '其他營業費用')
                `);
                console.log('預設會計科目初始化完成');
            } else {
                console.log('會計科目已存在，跳過初始化');
            }
        } catch (error) {
            console.error('初始化會計科目時發生錯誤:', error);
        }

        // 初始化預設交易類別
        try {
            const [categoryCount] = await sequelize.query(`
                SELECT COUNT(*) as count FROM accounting_categories
            `);

            if (parseInt((categoryCount[0] as any).count) === 0) {
                console.log('初始化預設交易類別...');
                await sequelize.query(`
                    INSERT INTO accounting_categories (category_code, category_name, category_type, description) VALUES
                    ('REV001', '商品銷售', 'revenue', '商品銷售收入'),
                    ('REV002', '服務收入', 'revenue', '服務提供收入'),
                    ('REV003', '利息收入', 'revenue', '銀行利息收入'),
                    ('EXP001', '薪資支出', 'expense', '員工薪資費用'),
                    ('EXP002', '租金支出', 'expense', '辦公室租金'),
                    ('EXP003', '水電費', 'expense', '水費電費支出'),
                    ('EXP004', '廣告費', 'expense', '廣告宣傳費用'),
                    ('EXP005', '辦公用品', 'expense', '辦公用品支出'),
                    ('EXP006', '差旅費', 'expense', '出差旅費'),
                    ('EXP007', '保險費', 'expense', '各項保險費用'),
                    ('ASS001', '現金交易', 'asset', '現金相關交易'),
                    ('ASS002', '銀行交易', 'asset', '銀行存款交易'),
                    ('ASS003', '固定資產', 'asset', '固定資產交易'),
                    ('LIA001', '應付帳款', 'liability', '應付帳款交易'),
                    ('LIA002', '應付薪資', 'liability', '應付薪資交易'),
                    ('EQU001', '資本交易', 'equity', '股東權益交易')
                `);
                console.log('預設交易類別初始化完成');
            } else {
                console.log('交易類別已存在，跳過初始化');
            }
        } catch (error) {
            console.error('初始化交易類別時發生錯誤:', error);
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