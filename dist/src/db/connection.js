const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 從環境變量獲取數據庫連接 URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asset_mgmt';

console.log('使用數據庫連接 URL:', process.env.NODE_ENV === 'production' ? '(生產環境 URL 已隱藏)' : DATABASE_URL);

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
        max: 3
    }
});

module.exports = sequelize; 