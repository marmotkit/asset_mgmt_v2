import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';

// 這個文件使用了 Sequelize ORM
// 參考：https://sequelize.org/master/manual/typescript.html

// 用戶角色枚舉
export enum UserRole {
    ADMIN = 'admin',
    NORMAL = 'normal',
    BUSINESS = 'business',
    LIFETIME = 'lifetime'
}

// 用戶狀態枚舉
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

// 用戶屬性接口
interface UserAttributes {
    id: string;
    memberNo: string;
    username: string;
    password?: string;
    plainPassword?: string; // 明文密碼（僅用於管理員查詢）
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    companyId?: string;
    isFirstLogin: boolean;
    preferences: string; // JSON 字符串
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isFirstLogin' | 'preferences'> { }

// 用戶模型
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public memberNo!: string;
    public username!: string;
    public password?: string;
    public plainPassword?: string;
    public name!: string;
    public email!: string;
    public role!: UserRole;
    public status!: UserStatus;
    public companyId?: string;
    public isFirstLogin!: boolean;
    public preferences!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        memberNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        plainPassword: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.NORMAL,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(UserStatus)),
            allowNull: false,
            defaultValue: UserStatus.ACTIVE,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        isFirstLogin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        preferences: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '[]',
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
        tableName: 'users',
        timestamps: true,
    }
);

export default User; 