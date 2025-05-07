"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberProfit = exports.ProfitSharingStandard = exports.ProfitSharingType = exports.ProfitSharingTypeEnum = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Investment_1 = __importDefault(require("./Investment"));
const User_1 = __importDefault(require("./User"));
// 分潤類型枚舉
var ProfitSharingTypeEnum;
(function (ProfitSharingTypeEnum) {
    ProfitSharingTypeEnum["PERCENTAGE"] = "percentage";
    ProfitSharingTypeEnum["FIXED_AMOUNT"] = "fixed_amount";
})(ProfitSharingTypeEnum || (exports.ProfitSharingTypeEnum = ProfitSharingTypeEnum = {}));
// 保持兼容性
exports.ProfitSharingType = ProfitSharingTypeEnum;
// 分潤標準模型
class ProfitSharingStandard extends sequelize_1.Model {
}
exports.ProfitSharingStandard = ProfitSharingStandard;
ProfitSharingStandard.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    investmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('percentage', 'fixed_amount'),
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    minAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    maxAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATEONLY,
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
    tableName: 'profit_sharing_standards',
    timestamps: true,
});
// 會員分潤模型
class MemberProfit extends sequelize_1.Model {
}
exports.MemberProfit = MemberProfit;
MemberProfit.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    investmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    memberId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    month: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'paid', 'late', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    paymentDate: {
        type: sequelize_1.DataTypes.DATE,
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
    tableName: 'member_profits',
    timestamps: true,
});
// 建立關聯
ProfitSharingStandard.belongsTo(Investment_1.default, { foreignKey: 'investmentId' });
MemberProfit.belongsTo(Investment_1.default, { foreignKey: 'investmentId' });
MemberProfit.belongsTo(User_1.default, { foreignKey: 'memberId', as: 'member' });
