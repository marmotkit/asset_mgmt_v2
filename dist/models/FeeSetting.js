"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
class FeeSetting extends sequelize_1.Model {
}
FeeSetting.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    memberType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        field: 'member_type',
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    period: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: 'updated_at',
    },
}, {
    sequelize: connection_1.default,
    tableName: 'fee_settings',
    timestamps: true,
    underscored: true,
});
console.log('FeeSetting model initialized:', typeof FeeSetting.create, typeof FeeSetting.findAll);
exports.default = FeeSetting;
