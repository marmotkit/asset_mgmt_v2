const User = require('./User');
const { UserRole, UserStatus } = require('./User');
const Company = require('./Company');
const { IndustryType } = require('./Company');
const sequelize = require('../db/connection');

// 設置模型關聯

// User 與 Company 關聯
User.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(User, { foreignKey: 'companyId' });

// 導出所有模型與相關類型
module.exports = {
    sequelize,
    User,
    UserRole,
    UserStatus,
    Company,
    IndustryType
}; 