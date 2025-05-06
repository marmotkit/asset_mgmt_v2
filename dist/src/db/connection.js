const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

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

module.exports = sequelize; 