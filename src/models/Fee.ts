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
        type: DataTypes.UUID,
        allowNull: false,
        field: 'member_id',
    },
    memberNo: {
        type: DataTypes.STRING,
        field: 'member_no',
    },
    memberName: {
        type: DataTypes.STRING,
        field: 'member_name',
    },
    memberType: {
        type: DataTypes.STRING,
        field: 'member_type',
    },
    amount: DataTypes.DECIMAL(12, 2),
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
    },
    status: {
        type: DataTypes.STRING,
        field: 'status',
    },
    note: DataTypes.TEXT,
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