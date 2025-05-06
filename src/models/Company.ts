import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/connection';

// 行業類型枚舉
export enum IndustryType {
    TECHNOLOGY = 'technology',
    FINANCE = 'finance',
    MANUFACTURING = 'manufacturing',
    REAL_ESTATE = 'real_estate',
    RETAIL = 'retail',
    EDUCATION = 'education',
    HEALTHCARE = 'healthcare',
    OTHER = 'other'
}

// 公司聯絡人接口
export interface CompanyContact {
    name: string;
    phone: string;
    email: string;
}

// 公司屬性接口
interface CompanyAttributes {
    id: string;
    companyNo: string;
    taxId: string;
    name: string;
    nameEn?: string;
    industry: string;
    address: string;
    contact: string; // JSON 字符串
    fax?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 創建時可選屬性
interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'createdAt' | 'updatedAt' | 'nameEn' | 'fax' | 'note'> { }

// 公司模型
class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
    public id!: string;
    public companyNo!: string;
    public taxId!: string;
    public name!: string;
    public nameEn?: string;
    public industry!: string;
    public address!: string;
    public contact!: string;
    public fax?: string;
    public note?: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    // 獲取聯絡人資訊
    public getContactInfo(): CompanyContact {
        return JSON.parse(this.contact);
    }

    // 設置聯絡人資訊
    public setContactInfo(contactInfo: CompanyContact): void {
        this.contact = JSON.stringify(contactInfo);
    }
}

Company.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        taxId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameEn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        industry: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: IndustryType.OTHER,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('contact');
                return rawValue ? JSON.parse(rawValue) : null;
            },
            set(value: CompanyContact) {
                this.setDataValue('contact', JSON.stringify(value));
            }
        },
        fax: {
            type: DataTypes.STRING,
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
        tableName: 'companies',
        timestamps: true,
    }
);

export default Company; 