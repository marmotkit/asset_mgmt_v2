"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceType = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Investment_1 = __importDefault(require("./Investment"));
const Rental_1 = require("./Rental");
// 發票類型枚舉
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["INVOICE2"] = "invoice2";
    InvoiceType["INVOICE3"] = "invoice3";
    InvoiceType["RECEIPT"] = "receipt"; // 收據
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
// 發票模型
class Invoice extends sequelize_1.Model {
}
Invoice.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('invoice2', 'invoice3', 'receipt'),
        allowNull: false,
    },
    paymentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'rental_payments',
            key: 'id'
        }
    },
    investmentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    buyerName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    buyerTaxId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    itemName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    note: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
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
    tableName: 'invoices',
    timestamps: true,
});
// 建立關聯
Invoice.belongsTo(Rental_1.RentalPayment, { foreignKey: 'paymentId', as: 'payment' });
Invoice.belongsTo(Investment_1.default, { foreignKey: 'investmentId' });
exports.default = Invoice;
