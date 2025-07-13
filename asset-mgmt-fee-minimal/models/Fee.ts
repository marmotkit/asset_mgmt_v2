import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

class Fee extends Model { }

Fee.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    member_id: {
        type: DataTypes.UUID,
        field: 'member_id',
    },
    memberName: {
        type: DataTypes.STRING,
        field: 'member_name',
    },
    amount: DataTypes.INTEGER,
    due_date: DataTypes.DATEONLY,
    status: DataTypes.STRING,
}, {
    sequelize,
    tableName: 'fees',
    timestamps: false,
});

export default Fee;