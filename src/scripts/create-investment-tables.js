const mysql = require('mysql2/promise');

// 資料庫連接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asset_management',
    port: process.env.DB_PORT || 3306
};

async function createInvestmentTables() {
    let connection;

    try {
        // 建立資料庫連接
        connection = await mysql.createConnection(dbConfig);
        console.log('資料庫連接成功');

        // 建立投資標的表
        const createInvestmentOpportunitiesTable = `
            CREATE TABLE IF NOT EXISTS investment_opportunities (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                subtitle VARCHAR(300),
                description TEXT NOT NULL,
                short_description VARCHAR(500),
                investment_amount DECIMAL(15,2) NOT NULL,
                min_investment DECIMAL(15,2),
                max_investment DECIMAL(15,2),
                investment_type ENUM('lease', 'equity', 'debt', 'real_estate', 'other') NOT NULL DEFAULT 'lease',
                location VARCHAR(200),
                industry VARCHAR(100),
                risk_level ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
                expected_return DECIMAL(5,2),
                investment_period INT,
                status ENUM('preview', 'active', 'hidden', 'closed') NOT NULL DEFAULT 'preview',
                featured BOOLEAN NOT NULL DEFAULT FALSE,
                sort_order INT NOT NULL DEFAULT 0,
                view_count INT NOT NULL DEFAULT 0,
                inquiry_count INT NOT NULL DEFAULT 0,
                created_by VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                published_at TIMESTAMP NULL,
                closed_at TIMESTAMP NULL,
                INDEX idx_status (status),
                INDEX idx_investment_type (investment_type),
                INDEX idx_risk_level (risk_level),
                INDEX idx_featured (featured),
                INDEX idx_created_at (created_at),
                INDEX idx_sort_order (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await connection.execute(createInvestmentOpportunitiesTable);
        console.log('✅ 投資標的表建立成功');

        // 建立投資標的圖片表
        const createInvestmentImagesTable = `
            CREATE TABLE IF NOT EXISTS investment_images (
                id VARCHAR(36) PRIMARY KEY,
                investment_id VARCHAR(36) NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                image_type ENUM('main', 'gallery', 'document') NOT NULL DEFAULT 'gallery',
                sort_order INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (investment_id) REFERENCES investment_opportunities(id) ON DELETE CASCADE,
                INDEX idx_investment_id (investment_id),
                INDEX idx_image_type (image_type),
                INDEX idx_sort_order (sort_order)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await connection.execute(createInvestmentImagesTable);
        console.log('✅ 投資標的圖片表建立成功');

        // 建立洽詢表
        const createInvestmentInquiriesTable = `
            CREATE TABLE IF NOT EXISTS investment_inquiries (
                id VARCHAR(36) PRIMARY KEY,
                investment_id VARCHAR(36) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(200) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(200),
                investment_amount DECIMAL(15,2),
                message TEXT,
                status ENUM('new', 'contacted', 'interested', 'not_interested', 'closed') NOT NULL DEFAULT 'new',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (investment_id) REFERENCES investment_opportunities(id) ON DELETE CASCADE,
                INDEX idx_investment_id (investment_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await connection.execute(createInvestmentInquiriesTable);
        console.log('✅ 洽詢表建立成功');

        // 插入範例資料
        await insertSampleData(connection);

        console.log('🎉 所有投資看板相關資料表建立完成！');

    } catch (error) {
        console.error('❌ 建立資料表失敗:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('資料庫連接已關閉');
        }
    }
}

async function insertSampleData(connection) {
    try {
        // 檢查是否已有資料
        const [existing] = await connection.execute(
            'SELECT COUNT(*) as count FROM investment_opportunities'
        );

        if (existing[0].count > 0) {
            console.log('📝 資料表已有資料，跳過範例資料插入');
            return;
        }

        console.log('📝 開始插入範例資料...');

        // 插入範例投資標的
        const sampleOpportunities = [
            {
                id: require('crypto').randomUUID(),
                title: '台北市信義區商辦大樓',
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
            },
            {
                id: require('crypto').randomUUID(),
                title: '台中市住宅建案',
                subtitle: '精華地段住宅開發',
                description: '台中市西屯區精華地段住宅建案，鄰近商圈和學校，生活機能完善。預計完工後可獲得良好租金收益。',
                short_description: '台中市西屯區精華地段住宅建案，生活機能完善',
                investment_amount: 80000000,
                min_investment: 3000000,
                max_investment: 15000000,
                investment_type: 'real_estate',
                location: '台中市西屯區',
                industry: '房地產',
                risk_level: 'medium',
                expected_return: 6.0,
                investment_period: 72,
                status: 'preview',
                featured: false,
                sort_order: 4,
                created_by: 'system'
            }
        ];

        for (const opportunity of sampleOpportunities) {
            await connection.execute(`
                INSERT INTO investment_opportunities (
                    id, title, subtitle, description, short_description,
                    investment_amount, min_investment, max_investment,
                    investment_type, location, industry, risk_level,
                    expected_return, investment_period, status, featured,
                    sort_order, created_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                opportunity.id, opportunity.title, opportunity.subtitle, opportunity.description,
                opportunity.short_description, opportunity.investment_amount, opportunity.min_investment,
                opportunity.max_investment, opportunity.investment_type, opportunity.location,
                opportunity.industry, opportunity.risk_level, opportunity.expected_return,
                opportunity.investment_period, opportunity.status, opportunity.featured,
                opportunity.sort_order, opportunity.created_by
            ]);
        }

        console.log('✅ 範例投資標的資料插入成功');

        // 插入範例洽詢
        const sampleInquiries = [
            {
                id: require('crypto').randomUUID(),
                investment_id: sampleOpportunities[0].id,
                name: '張小明',
                email: 'zhang@example.com',
                phone: '0912345678',
                company: '小明投資公司',
                investment_amount: 2000000,
                message: '對台北市信義區商辦大樓很感興趣，希望能了解更多詳細資訊。',
                status: 'new'
            },
            {
                id: require('crypto').randomUUID(),
                investment_id: sampleOpportunities[1].id,
                name: '李小華',
                email: 'li@example.com',
                phone: '0923456789',
                company: '華創投資',
                investment_amount: 1000000,
                message: '對AI新創公司投資有興趣，請提供更多技術和市場分析資料。',
                status: 'contacted'
            }
        ];

        for (const inquiry of sampleInquiries) {
            await connection.execute(`
                INSERT INTO investment_inquiries (
                    id, investment_id, name, email, phone, company,
                    investment_amount, message, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                inquiry.id, inquiry.investment_id, inquiry.name, inquiry.email,
                inquiry.phone, inquiry.company, inquiry.investment_amount,
                inquiry.message, inquiry.status
            ]);
        }

        console.log('✅ 範例洽詢資料插入成功');

    } catch (error) {
        console.error('❌ 插入範例資料失敗:', error);
        throw error;
    }
}

// 執行腳本
if (require.main === module) {
    createInvestmentTables()
        .then(() => {
            console.log('🎉 投資看板資料表初始化完成！');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 初始化失敗:', error);
            process.exit(1);
        });
}

module.exports = { createInvestmentTables }; 