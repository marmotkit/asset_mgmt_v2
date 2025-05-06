const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/connection');

// 產業類型枚舉
const IndustryType = {
    TECHNOLOGY: 'technology',
    FINANCE: 'finance',
    HEALTHCARE: 'healthcare',
    REAL_ESTATE: 'real_estate',
    MANUFACTURING: 'manufacturing',
    RETAIL: 'retail',
    OTHER: 'other'
};

// 公司模型
class Company extends Model { }

Company.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameEn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        taxId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        industry: {
            type: DataTypes.ENUM(...Object.values(IndustryType)),
            allowNull: false,
            defaultValue: IndustryType.OTHER,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                name: '',
                phone: '',
                email: ''
            }
        },
        fax: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        tableName: 'companies',
        timestamps: true,
    }
);

module.exports = Company;
module.exports.IndustryType = IndustryType; 