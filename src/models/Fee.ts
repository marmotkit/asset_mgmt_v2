import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

class Fee extends Model { }

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
    memberNo: DataTypes.STRING,
    memberName: DataTypes.STRING,
    memberType: DataTypes.STRING,
    amount: DataTypes.DECIMAL(12, 2),
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'due_date',
    },
    status: DataTypes.STRING,
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
    sequelize,
    tableName: 'fees',
    timestamps: true,
    underscored: true,
});

export default Fee; 