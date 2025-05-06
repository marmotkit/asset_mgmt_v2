"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentType = exports.InvestmentStatus = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const User_1 = __importDefault(require("./User"));
const Company_1 = __importDefault(require("./Company"));
// 投資狀態枚舉
var InvestmentStatus;
(function (InvestmentStatus) {
    InvestmentStatus["ACTIVE"] = "active";
    InvestmentStatus["INACTIVE"] = "inactive";
    InvestmentStatus["COMPLETED"] = "completed";
    InvestmentStatus["PENDING"] = "pending";
})(InvestmentStatus || (exports.InvestmentStatus = InvestmentStatus = {}));
// 投資類型枚舉
var InvestmentType;
(function (InvestmentType) {
    InvestmentType["MOVABLE"] = "movable";
    InvestmentType["IMMOVABLE"] = "immovable";
})(InvestmentType || (exports.InvestmentType = InvestmentType = {}));
// 投資模型
class Investment extends sequelize_1.Model {
}
Investment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    companyId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('movable', 'immovable'),
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'completed', 'pending'),
        allowNull: false,
        defaultValue: 'active',
    },
    // 動產特有欄位
    assetType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    serialNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    manufacturer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    // 不動產特有欄位
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    area: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    propertyType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    registrationNumber: {
        type: sequelize_1.DataTypes.STRING,
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
    tableName: 'investments',
    timestamps: true,
});
// 建立關聯
Investment.belongsTo(User_1.default, { foreignKey: 'userId' });
Investment.belongsTo(Company_1.default, { foreignKey: 'companyId' });
exports.default = Investment;
