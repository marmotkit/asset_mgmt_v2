import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

class Fee extends Model<any, any> { }

Fee.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    memberId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'member_id',
    },
    memberNo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'member_no',
    },
    memberName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'member_name',
    },
    memberType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'member_type',
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'fees',
    timestamps: true,
    underscored: true,
});

console.log('Fee model initialized:', typeof Fee.create, typeof Fee.findAll);

export default Fee; 