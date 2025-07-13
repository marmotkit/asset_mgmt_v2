import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

interface FeeSettingAttributes {
    id?: number;
    memberType: string;
    amount: number;
    period: string;
    description?: string;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

class FeeSetting extends Model<FeeSettingAttributes> implements FeeSettingAttributes {
    public id!: number;
    public memberType!: string;
    public amount!: number;
    public period!: string;
    public description?: string;
    public order!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FeeSetting.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    memberType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'member_type',
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    period: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
    },
}, {
    sequelize: sequelize,
    tableName: 'fee_settings',
    timestamps: true,
    underscored: true,
});

console.log('FeeSetting model initialized:', typeof FeeSetting.create, typeof FeeSetting.findAll);

export default FeeSetting;
export { FeeSettingAttributes }; 