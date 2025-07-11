import User, { UserRole, UserStatus } from './User';
import Company, { IndustryType, CompanyContact } from './Company';
import Investment, { InvestmentStatus, InvestmentType } from './Investment';
import { RentalStandard, RentalPayment, PaymentStatus, PaymentMethod } from './Rental';
import { ProfitSharingStandard, MemberProfit, ProfitSharingType } from './ProfitSharing';
import Invoice, { InvoiceType } from './Invoice';
import Fee from './Fee';
import sequelize from '../db/connection';

// 設置模型關聯

// User 與 Company 關聯
User.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(User, { foreignKey: 'companyId' });

// 導出所有模型與相關類型
export {
    sequelize,
    User,
    UserRole,
    UserStatus,
    Company,
    IndustryType,
    CompanyContact,
    Investment,
    InvestmentStatus,
    InvestmentType,
    RentalStandard,
    RentalPayment,
    PaymentStatus,
    PaymentMethod,
    ProfitSharingStandard,
    MemberProfit,
    ProfitSharingType,
    Invoice,
    InvoiceType,
    Fee
}; 