"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustryType = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
// 行業類型枚舉
var IndustryType;
(function (IndustryType) {
    IndustryType["TECHNOLOGY"] = "technology";
    IndustryType["FINANCE"] = "finance";
    IndustryType["MANUFACTURING"] = "manufacturing";
    IndustryType["REAL_ESTATE"] = "real_estate";
    IndustryType["RETAIL"] = "retail";
    IndustryType["EDUCATION"] = "education";
    IndustryType["HEALTHCARE"] = "healthcare";
    IndustryType["OTHER"] = "other";
})(IndustryType || (exports.IndustryType = IndustryType = {}));
// 公司模型
class Company extends sequelize_1.Model {
    // 獲取聯絡人資訊
    getContactInfo() {
        return JSON.parse(this.contact);
    }
    // 設置聯絡人資訊
    setContactInfo(contactInfo) {
        this.contact = JSON.stringify(contactInfo);
    }
}
Company.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    companyNo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    taxId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    nameEn: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    industry: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: IndustryType.OTHER,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('contact');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('contact', JSON.stringify(value));
        }
    },
    fax: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    note: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: connection_1.default,
    tableName: 'companies',
    timestamps: true,
});
exports.default = Company;
