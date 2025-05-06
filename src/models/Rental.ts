import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';
import Investment from './Investment';

// 租賃標準屬性
interface RentalStandardAttributes {
    id: string;
    investmentId: string;
    monthlyRent: number;
    startDate: string;
    endDate?: string;
    renterName: string;
    renterTaxId?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface RentalStandardCreationAttributes extends Optional<RentalStandardAttributes, 'id' | 'createdAt' | 'updatedAt' | 'endDate' | 'renterTaxId' | 'note'> { }

// 租賃標準模型
class RentalStandard extends Model<RentalStandardAttributes, RentalStandardCreationAttributes> implements RentalStandardAttributes {
    public id!: string;
    public investmentId!: string;
    public monthlyRent!: number;
    public startDate!: string;
    public endDate?: string;
    public renterName!: string;
    public renterTaxId?: string;
    public note?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 關聯
    public readonly investment?: Investment;
}

RentalStandard.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        investmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'investments',
                key: 'id'
            }
        },
        monthlyRent: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        renterName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        renterTaxId: {
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
        tableName: 'rental_standards',
        timestamps: true,
    }
);

// 付款狀態枚舉
export enum PaymentStatusEnum {
    PENDING = 'pending',
    PAID = 'paid',
    LATE = 'late',
    CANCELED = 'canceled'
}

// 保持兼容性
export const PaymentStatus = PaymentStatusEnum;

// 付款方式枚舉
export enum PaymentMethodEnum {
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    CREDIT_CARD = 'credit_card',
    CHEQUE = 'cheque'
}

// 保持兼容性
export const PaymentMethod = PaymentMethodEnum;

// 租金收款屬性
interface RentalPaymentAttributes {
    id: string;
    investmentId: string;
    year: number;
    month: number;
    amount: number;
    status: string;
    startDate: string;
    endDate: string;
    renterName: string;
    renterTaxId?: string;
    payerName?: string;
    paymentDate?: Date;
    paymentMethod?: string;
    receiptNo?: string;
    hasInvoice?: boolean;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface RentalPaymentCreationAttributes extends Optional<RentalPaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'renterTaxId' | 'payerName' | 'paymentDate' | 'paymentMethod' | 'receiptNo' | 'hasInvoice' | 'note'> { }

// 租金收款模型
class RentalPayment extends Model<RentalPaymentAttributes, RentalPaymentCreationAttributes> implements RentalPaymentAttributes {
    public id!: string;
    public investmentId!: string;
    public year!: number;
    public month!: number;
    public amount!: number;
    public status!: string;
    public startDate!: string;
    public endDate!: string;
    public renterName!: string;
    public renterTaxId?: string;
    public payerName?: string;
    public paymentDate?: Date;
    public paymentMethod?: string;
    public receiptNo?: string;
    public hasInvoice?: boolean;
    public note?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 關聯
    public readonly investment?: Investment;
}

RentalPayment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        investmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'investments',
                key: 'id'
            }
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'paid', 'late', 'canceled'),
            allowNull: false,
            defaultValue: 'pending',
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        renterName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        renterTaxId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payerName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'bank_transfer', 'credit_card', 'cheque'),
            allowNull: true,
        },
        receiptNo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hasInvoice: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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
        tableName: 'rental_payments',
        timestamps: true,
    }
);

// 建立關聯
RentalStandard.belongsTo(Investment, { foreignKey: 'investmentId' });
RentalPayment.belongsTo(Investment, { foreignKey: 'investmentId' });

// 導出模型
export { RentalStandard, RentalPayment }; 