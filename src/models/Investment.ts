import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';
import User from './User';
import Company from './Company';

// 投資狀態枚舉
export enum InvestmentStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMPLETED = 'completed',
    PENDING = 'pending'
}

// 投資類型枚舉
export enum InvestmentType {
    MOVABLE = 'movable',
    IMMOVABLE = 'immovable'
}

// 基本投資屬性接口
interface BaseInvestmentAttributes {
    id: string;
    companyId: string;
    userId: string;
    type: string;
    name: string;
    description: string;
    amount: number;
    startDate: string;
    endDate?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

// 動產投資特有屬性
interface MovableInvestmentAttributes extends BaseInvestmentAttributes {
    type: 'movable';
    assetType: string;
    serialNumber: string;
    manufacturer: string;
}

// 不動產投資特有屬性
interface ImmovableInvestmentAttributes extends BaseInvestmentAttributes {
    type: 'immovable';
    location: string;
    area: number;
    propertyType: string;
    registrationNumber: string;
}

// 投資屬性聯合類型
type InvestmentAttributes = MovableInvestmentAttributes | ImmovableInvestmentAttributes;

// 創建時可選屬性
type InvestmentCreationAttributes = Optional<InvestmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'endDate'>;

// 投資模型
class Investment extends Model<InvestmentAttributes, InvestmentCreationAttributes> {
    public id!: string;
    public companyId!: string;
    public userId!: string;
    public type!: string;
    public name!: string;
    public description!: string;
    public amount!: number;
    public startDate!: string;
    public endDate?: string;
    public status!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 動產特有屬性
    public assetType?: string;
    public serialNumber?: string;
    public manufacturer?: string;

    // 不動產特有屬性
    public location?: string;
    public area?: number;
    public propertyType?: string;
    public registrationNumber?: string;

    // 關聯
    public readonly user?: User;
    public readonly company?: Company;
}

Investment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM('movable', 'immovable'),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        amount: {
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
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'completed', 'pending'),
            allowNull: false,
            defaultValue: 'active',
        },
        // 動產特有欄位
        assetType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        manufacturer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // 不動產特有欄位
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        area: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        propertyType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        registrationNumber: {
            type: DataTypes.STRING,
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
        tableName: 'investments',
        timestamps: true,
    }
);

// 建立關聯
Investment.belongsTo(User, { foreignKey: 'userId' });
Investment.belongsTo(Company, { foreignKey: 'companyId' });

export default Investment; 