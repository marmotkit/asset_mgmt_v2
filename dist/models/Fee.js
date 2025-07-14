"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
class Fee extends sequelize_1.Model {
}
Fee.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    memberId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'member_id',
    },
    memberNo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'member_no',
    },
    memberName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'member_name',
    },
    memberType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        field: 'member_type',
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    dueDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    note: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'fees',
    timestamps: true,
    underscored: true,
});
console.log('Fee model initialized:', typeof Fee.create, typeof Fee.findAll);
exports.default = Fee;
