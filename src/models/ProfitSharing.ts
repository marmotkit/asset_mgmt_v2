import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';
import Investment from './Investment';
import User from './User';
import { PaymentStatus } from './Rental';

// 分潤類型枚舉
export enum ProfitSharingTypeEnum {
    PERCENTAGE = 'percentage',
    FIXED_AMOUNT = 'fixed_amount'
}

// 保持兼容性
export const ProfitSharingType = ProfitSharingTypeEnum;

// 分潤標準屬性
interface ProfitSharingStandardAttributes {
    id: string;
    investmentId: string;
    type: string;
    value: number;
    minAmount?: number;
    maxAmount?: number;
    startDate: string;
    endDate?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface ProfitSharingStandardCreationAttributes extends Optional<ProfitSharingStandardAttributes, 'id' | 'createdAt' | 'updatedAt' | 'minAmount' | 'maxAmount' | 'endDate' | 'note'> { }

// 分潤標準模型
class ProfitSharingStandard extends Model<ProfitSharingStandardAttributes, ProfitSharingStandardCreationAttributes> implements ProfitSharingStandardAttributes {
    public id!: string;
    public investmentId!: string;
    public type!: string;
    public value!: number;
    public minAmount?: number;
    public maxAmount?: number;
    public startDate!: string;
    public endDate?: string;
    public note?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 關聯
    public readonly investment?: Investment;
}

ProfitSharingStandard.init(
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
        type: {
            type: DataTypes.ENUM('percentage', 'fixed_amount'),
            allowNull: false,
        },
        value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        minAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        maxAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
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
        tableName: 'profit_sharing_standards',
        timestamps: true,
    }
);

// 會員分潤屬性
interface MemberProfitAttributes {
    id: string;
    investmentId: string;
    memberId: string;
    year: number;
    month: number;
    amount: number;
    status: string;
    paymentDate?: Date;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface MemberProfitCreationAttributes extends Optional<MemberProfitAttributes, 'id' | 'createdAt' | 'updatedAt' | 'paymentDate' | 'note'> { }

// 會員分潤模型
class MemberProfit extends Model<MemberProfitAttributes, MemberProfitCreationAttributes> implements MemberProfitAttributes {
    public id!: string;
    public investmentId!: string;
    public memberId!: string;
    public year!: number;
    public month!: number;
    public amount!: number;
    public status!: string;
    public paymentDate?: Date;
    public note?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 關聯
    public readonly investment?: Investment;
    public readonly member?: User;
}

MemberProfit.init(
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
        memberId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
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
        paymentDate: {
            type: DataTypes.DATE,
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
        tableName: 'member_profits',
        timestamps: true,
    }
);

// 建立關聯
ProfitSharingStandard.belongsTo(Investment, { foreignKey: 'investmentId' });
MemberProfit.belongsTo(Investment, { foreignKey: 'investmentId' });
MemberProfit.belongsTo(User, { foreignKey: 'memberId', as: 'member' });

// 導出
export { ProfitSharingStandard, MemberProfit }; 