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

async function fixInvestmentTables() {
    try {
        console.log('開始修正投資看板資料表結構...');

        // 1. 刪除舊的投資標的表
        console.log('1. 刪除舊的投資標的表...');
        await sequelize.query('DROP TABLE IF EXISTS investment_inquiries CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS investment_images CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS investment_documents CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS investment_opportunities CASCADE');
        console.log('✓ 舊表刪除成功');

        // 2. 重新建立投資標的表（符合 API 期望的結構）
        console.log('2. 重新建立投資標的表...');
        await sequelize.query(`
            CREATE TABLE investment_opportunities (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(300),
                description TEXT NOT NULL,
                short_description VARCHAR(500),
                investment_amount DECIMAL(15,2) NOT NULL,
                min_investment DECIMAL(15,2),
                max_investment DECIMAL(15,2),
                investment_type VARCHAR(50) NOT NULL,
                location VARCHAR(200),
                industry VARCHAR(100),
                risk_level VARCHAR(50) NOT NULL,
                expected_return DECIMAL(5,2),
                investment_period INTEGER,
                status VARCHAR(50) NOT NULL DEFAULT 'active',
                featured BOOLEAN DEFAULT FALSE,
                sort_order INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                inquiry_count INTEGER DEFAULT 0,
                created_by VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                closed_at TIMESTAMP
            )
        `);
        console.log('✓ 投資標的表重新建立成功');

        // 3. 建立投資洽詢表
        console.log('3. 建立投資洽詢表...');
        await sequelize.query(`
            CREATE TABLE investment_inquiries (
                id VARCHAR(36) PRIMARY KEY,
                investment_id VARCHAR(36) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(200) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(200),
                investment_amount DECIMAL(15,2),
                message TEXT,
                status VARCHAR(50) DEFAULT 'new',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (investment_id) REFERENCES investment_opportunities(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ 投資洽詢表建立成功');

        // 4. 建立投資標的圖片表
        console.log('4. 建立投資標的圖片表...');
        await sequelize.query(`
            CREATE TABLE investment_images (
                id VARCHAR(36) PRIMARY KEY,
                investment_id VARCHAR(36) NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                image_type VARCHAR(50) DEFAULT 'gallery',
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (investment_id) REFERENCES investment_opportunities(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ 投資標的圖片表建立成功');

        // 5. 建立投資標的文件表
        console.log('5. 建立投資標的文件表...');
        await sequelize.query(`
            CREATE TABLE investment_documents (
                id VARCHAR(36) PRIMARY KEY,
                investment_id VARCHAR(36) NOT NULL,
                document_name VARCHAR(255) NOT NULL,
                document_url VARCHAR(500) NOT NULL,
                document_type VARCHAR(100),
                file_size INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (investment_id) REFERENCES investment_opportunities(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ 投資標的文件表建立成功');

        // 6. 插入測試資料
        console.log('6. 插入測試投資標的...');
        const testData = [
            {
                id: require('crypto').randomUUID(),
                title: '台北市信義區商辦大樓投資案',
                subtitle: 'A級商辦大樓投資機會',
                description: '位於台北市信義區精華地段的A級商辦大樓，鄰近捷運站，交通便利。大樓設施完善，租客穩定，年租金報酬率約4.5%。適合長期投資持有。',
                short_description: '台北市信義區精華地段A級商辦大樓，年租金報酬率4.5%',
                investment_amount: 50000000,
                min_investment: 1000000,
                max_investment: 10000000,
                investment_type: 'real_estate',
                location: '台北市信義區',
                industry: '房地產',
                risk_level: 'low',
                expected_return: 4.5,
                investment_period: 60,
                status: 'active',
                featured: true,
                sort_order: 1,
                created_by: 'system'
            },
            {
                id: require('crypto').randomUUID(),
                title: '科技新創公司股權投資',
                subtitle: 'AI人工智慧技術公司',
                description: '專注於AI人工智慧技術開發的新創公司，擁有優秀的技術團隊和創新產品。公司已獲得多項專利，市場前景看好。',
                short_description: 'AI人工智慧技術新創公司，創新產品市場前景看好',
                investment_amount: 20000000,
                min_investment: 500000,
                max_investment: 5000000,
                investment_type: 'equity',
                location: '台北市內湖區',
                industry: '科技',
                risk_level: 'high',
                expected_return: 25.0,
                investment_period: 36,
                status: 'active',
                featured: true,
                sort_order: 2,
                created_by: 'system'
            },
            {
                id: require('crypto').randomUUID(),
                title: '設備租賃投資專案',
                subtitle: '醫療設備租賃',
                description: '專業醫療設備租賃投資專案，設備包括MRI、CT等高端醫療儀器。租賃對象為各大醫院，收入穩定可靠。',
                short_description: '專業醫療設備租賃，收入穩定可靠',
                investment_amount: 30000000,
                min_investment: 2000000,
                max_investment: 8000000,
                investment_type: 'lease',
                location: '全台灣',
                industry: '醫療',
                risk_level: 'medium',
                expected_return: 8.0,
                investment_period: 48,
                status: 'active',
                featured: false,
                sort_order: 3,
                created_by: 'system'
            }
        ];

        for (const data of testData) {
            await sequelize.query(`
                INSERT INTO investment_opportunities (
                    id, title, subtitle, description, short_description,
                    investment_amount, min_investment, max_investment,
                    investment_type, location, industry, risk_level,
                    expected_return, investment_period, status, featured,
                    sort_order, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: [
                    data.id, data.title, data.subtitle, data.description,
                    data.short_description, data.investment_amount, data.min_investment,
                    data.max_investment, data.investment_type, data.location,
                    data.industry, data.risk_level, data.expected_return,
                    data.investment_period, data.status, data.featured,
                    data.sort_order, data.created_by
                ]
            });
        }
        console.log('✓ 測試投資標的建立成功');

        console.log('\n=== 投資看板資料表結構修正完成 ===');
        console.log('已修正的資料表:');
        console.log('- investment_opportunities (投資標的) - 符合 API 期望結構');
        console.log('- investment_inquiries (投資洽詢)');
        console.log('- investment_images (投資標的圖片)');
        console.log('- investment_documents (投資標的文件)');

    } catch (error) {
        console.error('修正投資看板資料表失敗:', error);
    } finally {
        await sequelize.close();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    fixInvestmentTables();
}

module.exports = fixInvestmentTables; 