"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalPayment = exports.RentalStandard = exports.PaymentMethod = exports.PaymentStatus = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const Investment_1 = __importDefault(require("./Investment"));
// 租賃標準模型
class RentalStandard extends sequelize_1.Model {
}
exports.RentalStandard = RentalStandard;
RentalStandard.init({
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
    monthlyRent: {
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
    renterName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    renterTaxId: {
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
    tableName: 'rental_standards',
    timestamps: true,
});
// 付款狀態枚舉
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["LATE"] = "late";
    PaymentStatus["CANCELED"] = "canceled";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// 付款方式枚舉
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["CHEQUE"] = "cheque";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// 租金收款模型
class RentalPayment extends sequelize_1.Model {
}
exports.RentalPayment = RentalPayment;
RentalPayment.init({
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
    startDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    renterName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    renterTaxId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    payerName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paymentDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.ENUM('cash', 'bank_transfer', 'credit_card', 'cheque'),
        allowNull: true,
    },
    receiptNo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hasInvoice: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
    tableName: 'rental_payments',
    timestamps: true,
});
// 建立關聯
RentalStandard.belongsTo(Investment_1.default, { foreignKey: 'investmentId' });
RentalPayment.belongsTo(Investment_1.default, { foreignKey: 'investmentId' });
