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
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: 'member_id',
    },
    memberNo: sequelize_1.DataTypes.STRING,
    memberName: sequelize_1.DataTypes.STRING,
    memberType: sequelize_1.DataTypes.STRING,
    amount: sequelize_1.DataTypes.DECIMAL(12, 2),
    dueDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
    },
    status: sequelize_1.DataTypes.STRING,
    note: sequelize_1.DataTypes.TEXT,
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
exports.default = Fee;
