const { QueryTypes } = require('sequelize');
const sequelize = require('../db/connection').default;

// 模擬 localStorage 中的投資資料（從前端複製）
const mockInvestments = [
    {
        id: '1',
        companyId: '1',
        userId: '6e74484c-af9c-4a4e-be82-c91d65000c29',
        type: 'movable',
        name: '設備投資A',
        description: '生產線設備',
        amount: 1000000,
        startDate: '2023-01-01',
        status: 'active',
        assetType: '機械設備',
        serialNumber: 'EQ-001',
        manufacturer: '台灣機械',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
    },
    {
        id: '2',
        companyId: '2',
        userId: '6e74484c-af9c-4a4e-be82-c91d65000c29',
        type: 'immovable',
        name: '不動產投資B',
        description: '商業辦公室',
        amount: 5000000,
        startDate: '2023-02-01',
        status: 'active',
        location: '台北市信義區',
        area: 150,
        propertyType: '商業辦公室',
        registrationNumber: 'LD-002',
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: '2023-02-01T00:00:00Z'
    }
];

async function migrateInvestments() {
    try {
        console.log('開始遷移投資資料...');

        // 檢查是否已有投資資料
        const existingCount = await sequelize.query(
            'SELECT COUNT(*) as count FROM investments',
            { type: QueryTypes.SELECT }
        );

        if (existingCount[0].count > 0) {
            console.log(`資料庫中已有 ${existingCount[0].count} 筆投資資料，跳過遷移`);
            return;
        }

        // 獲取現有的公司和會員資料
        const companies = await sequelize.query(
            'SELECT id, name FROM companies LIMIT 2',
            { type: QueryTypes.SELECT }
        );

        const users = await sequelize.query(
            'SELECT id, name FROM users LIMIT 1',
            { type: QueryTypes.SELECT }
        );

        console.log(`找到 ${companies.length} 家公司，${users.length} 位會員`);

        // 遷移投資資料
        for (const investment of mockInvestments) {
            // 使用現有的公司ID或創建新的
            let companyId = investment.companyId;
            if (companies.length > 0) {
                companyId = companies[0].id;
            }

            // 使用現有的會員ID或創建新的
            let userId = investment.userId;
            if (users.length > 0) {
                userId = users[0].id;
            }

            const insertQuery = `
                INSERT INTO investments (
                    id, company_id, user_id, type, name, description, amount,
                    start_date, end_date, status, asset_type, serial_number,
                    manufacturer, location, area, property_type, registration_number,
                    created_at, updated_at
                ) VALUES (
                    :id, :company_id, :user_id, :type, :name, :description, :amount,
                    :start_date, :end_date, :status, :asset_type, :serial_number,
                    :manufacturer, :location, :area, :property_type, :registration_number,
                    :created_at, :updated_at
                )
            `;

            await sequelize.query(insertQuery, {
                replacements: {
                    id: investment.id,
                    company_id: companyId,
                    user_id: userId,
                    type: investment.type,
                    name: investment.name,
                    description: investment.description,
                    amount: investment.amount,
                    start_date: investment.startDate,
                    end_date: investment.endDate,
                    status: investment.status,
                    asset_type: investment.assetType,
                    serial_number: investment.serialNumber,
                    manufacturer: investment.manufacturer,
                    location: investment.location,
                    area: investment.area,
                    property_type: investment.propertyType,
                    registration_number: investment.registrationNumber,
                    created_at: investment.createdAt,
                    updated_at: investment.updatedAt
                },
                type: QueryTypes.INSERT
            });

            console.log(`已遷移投資項目: ${investment.name}`);
        }

        console.log('投資資料遷移完成！');

    } catch (error) {
        console.error('遷移投資資料失敗:', error);
        throw error;
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    migrateInvestments()
        .then(() => {
            console.log('遷移完成');
            process.exit(0);
        })
        .catch((error) => {
            console.error('遷移失敗:', error);
            process.exit(1);
        });
}

module.exports = { migrateInvestments }; 