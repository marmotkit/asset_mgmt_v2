const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 從環境變量獲取數據庫連接 URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

// 輸出更多診斷信息
console.log('環境變數檢查:');
console.log('- NODE_ENV:', process.env.NODE_ENV || '未設置');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '已設置' : '未設置');
console.log('- PORT:', process.env.PORT || '未設置');

// 解析數據庫連接字符串 (僅用於診斷)
function parseDatabaseUrl(url) {
    try {
        if (!url) return { valid: false, message: 'URL 未提供' };

        const regex = /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
        const match = url.match(regex);

        if (!match) {
            return { valid: false, message: 'URL 格式不正確' };
        }

        return {
            valid: true,
            host: match[3],
            port: match[4],
            database: match[5],
            user: match[1]
        };
    } catch (error) {
        return { valid: false, message: error.message };
    }
}

// 只在非生產環境輸出解析結果
if (process.env.NODE_ENV !== 'production') {
    const parsedUrl = parseDatabaseUrl(DATABASE_URL);
    console.log('數據庫連接解析結果:', parsedUrl);
} else {
    console.log('生產環境中不顯示數據庫連接詳情');
}

// 創建 Sequelize 實例
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 5,  // 增加重試次數
        timeout: 60000  // 增加超時時間
    }
});

module.exports = sequelize; 