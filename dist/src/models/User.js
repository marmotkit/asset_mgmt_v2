const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/connection');

// 用戶角色枚舉
const UserRole = {
    ADMIN: 'admin',
    NORMAL: 'normal',
    BUSINESS: 'business',
    LIFETIME: 'lifetime'
};

// 用戶狀態枚舉
const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

// 用戶模型
class User extends Model { }

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        memberNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.NORMAL,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(UserStatus)),
            allowNull: false,
            defaultValue: UserStatus.ACTIVE,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        isFirstLogin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        preferences: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '[]',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

module.exports = User;
module.exports.UserRole = UserRole;
module.exports.UserStatus = UserStatus; 