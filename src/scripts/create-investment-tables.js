const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

async function createInvestmentTables() {
    try {
        console.log('開始建立投資看板資料表...');

        // 1. 建立投資標的表
        console.log('1. 建立投資標的表...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS investment_opportunities (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                investment_type VARCHAR(100) NOT NULL,
                min_investment DECIMAL(15,2) NOT NULL,
                max_investment DECIMAL(15,2),
                total_amount DECIMAL(15,2) NOT NULL,
                current_amount DECIMAL(15,2) DEFAULT 0,
                expected_return DECIMAL(5,2),
                duration_months INTEGER,
                risk_level VARCHAR(50),
                location VARCHAR(255),
                contact_person VARCHAR(100),
                contact_phone VARCHAR(50),
                contact_email VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ 投資標的表建立成功');

        // 2. 建立投資洽詢表
        console.log('2. 建立投資洽詢表...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS investment_inquiries (
                id SERIAL PRIMARY KEY,
                opportunity_id INTEGER NOT NULL,
                member_no VARCHAR(50) NOT NULL,
                member_name VARCHAR(100) NOT NULL,
                contact_phone VARCHAR(50),
                contact_email VARCHAR(100),
                investment_amount DECIMAL(15,2),
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (opportunity_id) REFERENCES investment_opportunities(id)
            )
        `);
        console.log('✓ 投資洽詢表建立成功');

        // 3. 建立投資標的圖片表
        console.log('3. 建立投資標的圖片表...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS investment_images (
                id SERIAL PRIMARY KEY,
                opportunity_id INTEGER NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                image_type VARCHAR(50) DEFAULT 'main',
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (opportunity_id) REFERENCES investment_opportunities(id)
            )
        `);
        console.log('✓ 投資標的圖片表建立成功');

        // 4. 建立投資標的文件表
        console.log('4. 建立投資標的文件表...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS investment_documents (
                id SERIAL PRIMARY KEY,
                opportunity_id INTEGER NOT NULL,
                document_name VARCHAR(255) NOT NULL,
                document_url VARCHAR(500) NOT NULL,
                document_type VARCHAR(100),
                file_size INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (opportunity_id) REFERENCES investment_opportunities(id)
            )
        `);
        console.log('✓ 投資標的文件表建立成功');

        // 5. 插入測試資料
        console.log('5. 插入測試投資標的...');
        await sequelize.query(`
            INSERT INTO investment_opportunities (
                title, description, investment_type, min_investment, max_investment, 
                total_amount, expected_return, duration_months, risk_level, location,
                contact_person, contact_phone, contact_email
            ) VALUES 
            (
                '台北市信義區商辦大樓投資案',
                '位於信義區精華地段的商辦大樓，鄰近捷運站，交通便利，適合長期投資。',
                '不動產投資',
                500000,
                5000000,
                50000000,
                8.5,
                60,
                '中等',
                '台北市信義區信義路五段',
                '張經理',
                '02-2345-6789',
                'zhang@investment.com'
            ),
            (
                '新竹科技園區廠房投資',
                '新竹科學園區內優質廠房，適合科技產業進駐，租金收益穩定。',
                '廠房投資',
                1000000,
                10000000,
                100000000,
                7.2,
                48,
                '低風險',
                '新竹市東區科學園區',
                '李專員',
                '03-3456-7890',
                'lee@investment.com'
            ),
            (
                '台中市西屯區住宅開發案',
                '台中市西屯區優質住宅開發案，鄰近商圈和學校，投資報酬率佳。',
                '住宅開發',
                2000000,
                20000000,
                200000000,
                9.0,
                72,
                '中高風險',
                '台中市西屯區',
                '王總監',
                '04-4567-8901',
                'wang@investment.com'
            )
            ON CONFLICT DO NOTHING
        `);
        console.log('✓ 測試投資標的建立成功');

        console.log('\n=== 投資看板資料表建立完成 ===');
        console.log('已建立的資料表:');
        console.log('- investment_opportunities (投資標的)');
        console.log('- investment_inquiries (投資洽詢)');
        console.log('- investment_images (投資標的圖片)');
        console.log('- investment_documents (投資標的文件)');

    } catch (error) {
        console.error('建立投資看板資料表失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    createInvestmentTables();
}

module.exports = createInvestmentTables; 