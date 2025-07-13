import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

class Fee extends Model { }

Fee.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    memberName: DataTypes.STRING,
    amount: DataTypes.INTEGER,
}, {
    sequelize,
    tableName: 'fees',
    timestamps: false,
});

export default Fee;