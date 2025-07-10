const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    ssl: process.env.NODE_ENV === 'production',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

async function resetDatabaseDirectly() {
    try {
        console.log('開始直接重置資料庫...');

        // 1. 連接資料庫
        await sequelize.authenticate();
        console.log('✓ 資料庫連接成功');

        // 2. 刪除所有表格
        console.log('2. 刪除所有表格...');
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');
        console.log('✓ 所有表格已刪除');

        // 3. 重新建立所有表格
        console.log('3. 重新建立所有表格...');

        // 建立 companies 表格
        await sequelize.query(`
            CREATE TABLE companies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "companyNo" VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                phone VARCHAR(255),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        // 建立 users 表格
        await sequelize.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "memberNo" VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                status VARCHAR(255) NOT NULL,
                "companyId" UUID REFERENCES companies(id),
                "isFirstLogin" BOOLEAN NOT NULL DEFAULT TRUE,
                preferences TEXT NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        // 建立 investments 表格
        await sequelize.query(`
            CREATE TABLE investments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "companyId" UUID NOT NULL REFERENCES companies(id),
                "userId" UUID NOT NULL REFERENCES users(id),
                type VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                "startDate" DATE NOT NULL,
                "endDate" DATE,
                status VARCHAR(255) NOT NULL,
                description TEXT,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        // 建立其他表格...
        await sequelize.query(`
            CREATE TABLE rentals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "investmentId" UUID NOT NULL REFERENCES investments(id),
                "monthlyRent" NUMERIC(15,2) NOT NULL,
                "startDate" DATE NOT NULL,
                "endDate" DATE,
                "renterName" VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        await sequelize.query(`
            CREATE TABLE profit_sharing (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "investmentId" UUID NOT NULL REFERENCES investments(id),
                type VARCHAR(255) NOT NULL,
                value NUMERIC(15,2) NOT NULL,
                "startDate" DATE NOT NULL,
                "endDate" DATE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        await sequelize.query(`
            CREATE TABLE payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "memberId" UUID NOT NULL REFERENCES users(id),
                amount NUMERIC(15,2) NOT NULL,
                "dueDate" DATE NOT NULL,
                status VARCHAR(255) NOT NULL,
                note VARCHAR(255),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        await sequelize.query(`
            CREATE TABLE invoices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "paymentId" UUID NOT NULL REFERENCES payments(id),
                type VARCHAR(255) NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        console.log('✓ 所有表格已重新建立');

        // 4. 插入基本資料
        console.log('4. 插入基本資料...');

        // 插入管理者帳號
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await sequelize.query(`
            INSERT INTO users ("memberNo", username, password, name, email, role, status, "isFirstLogin", preferences)
            VALUES ('A001', 'admin', $1, '系統管理員', 'admin@example.com', 'admin', 'active', false, '[]')
        `, { bind: [hashedPassword] });

        // 插入測試公司
        await sequelize.query(`
            INSERT INTO companies ("companyNo", name, address, phone)
            VALUES ('C001', '測試公司', '台北市測試區測試路123號', '02-1234-5678')
        `);

        // 插入測試會員
        const testPassword = await bcrypt.hash('test123', 10);
        await sequelize.query(`
            INSERT INTO users ("memberNo", username, password, name, email, role, status, "isFirstLogin", preferences)
            VALUES ('M001', 'test', $1, '測試會員', 'test@example.com', 'normal', 'active', false, '[]')
        `, { bind: [testPassword] });

        console.log('✓ 基本資料已插入');

        console.log('\n=== 資料庫重置完成 ===');
        console.log('管理者帳號: admin / admin123');
        console.log('測試會員: test / test123');

    } catch (error) {
        console.error('資料庫重置失敗:', error);
    } finally {
        await sequelize.close();
    }
}

resetDatabaseDirectly(); 