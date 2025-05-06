import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';
import Investment from './Investment';
import { RentalPayment } from './Rental';

// 發票類型枚舉
export enum InvoiceType {
    INVOICE2 = 'invoice2',      // 二聯式發票
    INVOICE3 = 'invoice3',      // 三聯式發票
    RECEIPT = 'receipt'         // 收據
}

// 發票屬性接口
interface InvoiceAttributes {
    id: string;
    type: string;
    paymentId: string;
    investmentId: string;
    buyerName: string;
    buyerTaxId?: string;
    amount: number;
    itemName: string;
    note?: string;
    date: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface InvoiceCreationAttributes extends Optional<InvoiceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'buyerTaxId' | 'note'> { }

// 發票模型
class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
    public id!: string;
    public type!: string;
    public paymentId!: string;
    public investmentId!: string;
    public buyerName!: string;
    public buyerTaxId?: string;
    public amount!: number;
    public itemName!: string;
    public note?: string;
    public date!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 關聯
    public readonly payment?: RentalPayment;
    public readonly investment?: Investment;
}

Invoice.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM('invoice2', 'invoice3', 'receipt'),
            allowNull: false,
        },
        paymentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'rental_payments',
                key: 'id'
            }
        },
        investmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'investments',
                key: 'id'
            }
        },
        buyerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        buyerTaxId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
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
        tableName: 'invoices',
        timestamps: true,
    }
);

// 建立關聯
Invoice.belongsTo(RentalPayment, { foreignKey: 'paymentId', as: 'payment' });
Invoice.belongsTo(Investment, { foreignKey: 'investmentId' });

export default Invoice; 